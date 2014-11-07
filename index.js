/* TODO
 * - only show relevant buttons
 * - save to file
 * - on save, invert image, shutter sound
 * - mobile tap events
 * - portrait support
 */


var app = angular.module("sprayit", []);

app.controller("SprayController", function($scope, $timeout, spray) {
  $scope.save = function() {
    spray.save($("canvas").get(0).toDataURL());
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
    $timeout(function() {
      $scope.redraw();
    });
  };
  $(window).resize(function() {
    if (guard) {
      guard = clearTimeout(guard);
    } else {
      guard = setTimeout(redraw, 10);
    }
  });
  redraw();
});

app.factory("spray", function() {
  return {
    save: function(image) {
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

      // Paint. Tribute: http://perfectionkills.com/exploring-canvas-drawing-techniques/
      function distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
      }
      function angleBetween(point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
      }
      var isDrawing, lastPoint, size = 2;
      context.canvas.onmousedown = function(e) {
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
            left: Math.floor((maxWidth - width) / 2),
            top: (maxHeight - height) / 2
          });
          $centerSpan.css({
            left: Math.floor((maxWidth -width) / 4)
          });
          context.drawImage(train, 0, 0, width, height);
        };
        train.src = $scope.src;
      };
    }
  };
});