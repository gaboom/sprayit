var app = angular.module("sprayit", []).config([
  '$compileProvider',
  function($compileProvider)
  {
    // Tribute: http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|filesystem):/);
  }
]);

app.controller("SprayedController", function($scope, $timeout, $interval) {
  var INTERVAL = 15 * 1000; // milliseconds

  // Load all images
  var images = ["img/train.jpg", "img/wall.jpg"];
  function random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  function fsFail(e) {
    console.log(e);
    throw new Error(e);
  }
  function fsOk(fs) {
    var dirReader = fs.root.createReader();
    function toArray(list) {
      return Array.prototype.slice.call(list || [], 0);
    }
    var readEntries = function() {
      dirReader.readEntries(function(results) {
        if (results.length) {
          toArray(results).forEach(function(file) {
            images.push(file.toURL());
          });
          readEntries();
        }
      }, fsFail);
    };
    readEntries();
  }
  var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  if (requestFileSystem) {
    requestFileSystem(window.PERSISTENT, 0, fsOk, fsFail);
  }

  window.image = function() {
    images.push(image);
  };

  // Display random image
  $scope.change = function() {
    $timeout(function() {
      $scope.src = random(images);
      $scope.alt = $scope.src;
    });
  };
  $interval($scope.change, INTERVAL);
  $scope.change();
});

app.directive('imgResponsive', function($timeout) {
  return {
    scope: false,
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      var guard;
      var $img = $($element);

      var redraw = function() {
        guard = null;
        var margin = 0.95;
        var maxWidth = window.innerWidth * margin;
        var maxHeight = window.innerHeight * margin;
        var ratio = $img[0].naturalHeight / $img[0].naturalWidth;
        var width = Math.min($img[0].naturalWidth, maxWidth);
        var height = width * ratio;
        if (height > maxHeight) {
          height = maxHeight;
          width = height / ratio;
        }
        $img.css({
          width: width,
          height: height,
          left: (maxWidth / margin - width) / 2,
          top: (maxHeight / margin - height) / 2
        });
      };

      $element.click($scope.change);

      $element.bind('load', redraw);

      $(window).resize(function() {
        if (guard) {
          clearTimeout(guard);
        }
        guard = setTimeout(redraw, 10);
      });
    }
  };
});
