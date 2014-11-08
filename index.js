/* TODO
 * - viewer
 * - message new image
 * - load image
 * - mobile tap events
 * - install instructions
 */


var app = angular.module("sprayit", []).config([
  '$compileProvider',
  function($compileProvider)
  {
    // Tribute: http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem):/);
  }
]);

app.controller("SprayController", function($scope, $timeout, spray) {
  window.open("viewer.html");
  
  $scope.void = true;
  $scope.save = function() {
    $scope.void = true;
    var data = $("canvas").get(0).toDataURL("image/png");
    spray.save(spray.dataURLToBlob(data));
  };

  $scope.load = function($event) {
    $('#control button.image').removeClass('active');
    $($event.target).addClass('active');
    $scope.src = $($event.target).attr("src");
    $scope.redraw();
  };

  $scope.rgb = function($event) {
    $('#control button.color').removeClass('active');
    var $target = $($event.currentTarget).addClass('active');
    $scope.color = $target.attr("data-color");
  };

  $scope.color = $('#control button.color:first').addClass('active').attr('data-color');
  $scope.src = $('#control button.image:first > img').addClass('active').attr('src');

  var guard;
  var redraw = function() {
    guard = null;
    $timeout(function() {
      $scope.redraw();
    });
  };
  $(window).resize(function() {
    if (guard) {
      clearTimeout(guard);
    }
    guard = setTimeout(redraw, 10);
  });
  redraw();
});

app.factory("spray", function() {
  var QUOTA = 10 * 1024 * 1024 * 1024; // 100 GB OK ?
  var fs = null;

  function fsOk(filesystem) {
    fs = filesystem;
  }
  function fsFail(e) {
    alert("We've got some trouble.");
    throw e;
  }
  function quotaOk() {
    var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    requestFileSystem(window.PERSISTENT, QUOTA, fsOk, fsFail);
  }

  if (navigator.webkitPersistentStorage) {
    navigator.webkitPersistentStorage.requestQuota(QUOTA, quotaOk, fsFail);
  } else {
    if (window.webkitStorageInfo.requestQuota) {
      window.webkitStorageInfo.requestQuota(window.PERSISTENT, QUOTA, quotaOk, fsFail);
    }
  }

  return {
    save: function(image) {
      if (fs === null) {
        alert("Save is possible with Chrome browser!\nPlease reload in Chrome\nand press OK on the top\nwhen asked for storage use!");
        return;
      }
      var now = new Date();
      fs.root.getFile(now.getFullYear() + '' + now.getMonth() + '' + now.getMonth() + '' + now.getDate()
        + '-' + now.getHours() + '' + now.getMinutes() + '' + now.getSeconds() + '-' + now.getMilliseconds() + '.png',
        {create: true, exclusive: true}, function(file) {
        file.createWriter(function(writer) {
          writer.onwriteend = function(e) {
            setTimeout(function(){
              $("canvas").css({"-webkit-filter": "", "filter": ""});
            }, 500);
          };
          writer.onerror = fsFail;
          document.getElementById("audio").play();
          $("canvas").css({"-webkit-filter": "invert(100%)", "filter": "invert(100%)"});
          writer.write(image);
        }, fsFail);
      }, fsFail);
    },
    dataURLToBlob: function(dataURL) {
      // Tribute: http://stackoverflow.com/questions/12168909/blob-from-dataurl
      var BASE64_MARKER = ';base64,';
      if (dataURL.indexOf(BASE64_MARKER) === -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);

        return new Blob([raw], {type: contentType});
      }

      var parts = dataURL.split(BASE64_MARKER);
      var contentType = parts[0].split(':')[1];
      var raw = window.atob(parts[1]);
      var rawLength = raw.length;

      var uInt8Array = new Uint8Array(rawLength);

      for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], {type: contentType});
    }
  };
});

app.directive("sprayCanvas", function($timeout) {
  return {
    scope: false,
    restrict: 'A',
    link: function($scope, element) {
      var $canvas = $(element[0]);
      var context = element[0].getContext("2d");

      // Tribute: http://perfectionkills.com/exploring-canvas-drawing-techniques/
      function distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
      }
      function angleBetween(point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
      }
      var isDrawing, lastPoint, size = 2;
      context.canvas.onmousedown = function(e) {
        $timeout(function() {
          $scope.void = false;
        });
        isDrawing = true;
        lastPoint = {x: e.offsetX === undefined ? e.layerX : e.offsetX, y: e.offsetY === undefined ? e.layerY : e.offsetY};
        context.lineJoin = context.lineCap = 'round';
      };
      context.canvas.onmousemove = function(e) {
        if (!isDrawing) {
          return;
        }
        var currentPoint = {x: e.offsetX === undefined ? e.layerX : e.offsetX, y: e.offsetY === undefined ? e.layerY : e.offsetY};
        var dist = distanceBetween(lastPoint, currentPoint);
        var angle = angleBetween(lastPoint, currentPoint);
        for (var i = 0; i < dist; i += size) {
          var x = lastPoint.x + (Math.sin(angle) * i);
          var y = lastPoint.y + (Math.cos(angle) * i);
          var radgrad = context.createRadialGradient(x, y, size, x, y, size * 2);
          radgrad.addColorStop(1, 'rgba(' + $scope.color + ',1)');
          radgrad.addColorStop(0.5, 'rgba(' + $scope.color + ',0.5)');
          radgrad.addColorStop(1, 'rgba(' + $scope.color + ',0)');
          context.fillStyle = radgrad;
          context.fillRect(x - (size * 2), y - (size * 2), (size * 4), (size * 4));
        }
        lastPoint = currentPoint;
      };
      context.canvas.onmouseup = function() {
        isDrawing = false;
      };

      // Resize and redraw the canvas
      $scope.redraw = function() {
        isDrawing = false;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        var $centerSpan = $("#control > span");

        var train = new Image();
        train.onload = function() {
          var maxWidth = window.innerWidth * 11 / 12; // col-xs-11 width
          var maxHeight = window.innerHeight * 1 - 0; // row height
          var ratio = train.naturalHeight / train.naturalWidth;
          var width = Math.min(train.naturalWidth, maxWidth);
          var height = width * ratio;
          if (height > maxHeight) {
            height = maxHeight;
            width = height / ratio;
          }
          context.canvas.width = width;
          context.canvas.height = height;
          $canvas.css({
            left: Math.ceil((maxWidth - width) / 2),
            top: (maxHeight - height) / 2
          });
          $centerSpan.css({
            left: Math.floor((maxWidth - width) / 4)
          });
          context.drawImage(train, 0, 0, width, height);
          $timeout(function(){
            $scope.void = true;
          });
        };
        train.src = $scope.src;
      };
    }
  };
});