var app = angular.module("sprayit", []);

app.controller("SprayController", function($scope, $timeout, spray) {
  $scope.images = spray.load();
  
  $scope.save = function(){
    spray.save($scope.images, $("canvas").get(0).toDataURL());
  };
  
  $timeout(function() {
    $scope.reset();
  });
});

app.factory("spray", function() {
  return {
    load: function() {
      return [];
    },
    save: function(images, image) {
      images.unshift({src: image});
    }
  };
});

app.directive("sprayInit", function($timeout) {
  return {
    scope: false,
    restrict: 'A',
    link: function($scope, element) {
      var reset = null;
      $scope.reset = function() {
        if (reset) {
          clearTimeout(reset);
        } else {
          $timeout(function() {
            $scope.loaded = false;
          });
        }
        reset = setTimeout(function() {
          reset = null;
          $scope.init();
        }, 500);
      };
      $(window).resize($scope.reset);
    }
  };
});

app.directive("sprayCanvas", function($timeout) {
  return {
    scope: false,
    restrict: 'A',
    link: function($scope, element) {
      var context = element[0].getContext("2d");
      var color;
      $scope.color = function($event, setColor) {
        if (setColor !== undefined) {
          $('#control > button').removeClass('active');
          $($event.currentTarget).addClass('active');
          color = setColor;
        }
        return color;
      };

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
        lastPoint = {x: e.clientX, y: e.clientY};
        context.lineJoin = context.lineCap = 'round';
      };
      context.canvas.onmousemove = function(e) {
        if (!isDrawing) {
          return;
        }
        var currentPoint = {x: e.clientX, y: e.clientY};
        var dist = distanceBetween(lastPoint, currentPoint);
        var angle = angleBetween(lastPoint, currentPoint);
        for (var i = 0; i < dist; i += size) {
          var x = lastPoint.x + (Math.sin(angle) * i);
          var y = lastPoint.y + (Math.cos(angle) * i);
          var radgrad = context.createRadialGradient(x, y, size, x, y, size * 2);
          radgrad.addColorStop(1, 'rgba('+color+','+color+','+color+',1)');
          radgrad.addColorStop(0.5, 'rgba('+color+','+color+','+color+',0.5)');
          radgrad.addColorStop(1, 'rgba('+color+','+color+','+color+',0)');
          context.fillStyle = radgrad;
          context.fillRect(x - (size * 2), y - (size * 2), (size * 4), (size * 4));
        }
        lastPoint = currentPoint;
      };
      context.canvas.onmouseup = function() {
        isDrawing = false;
      };

      // Resize and redraw the canvas
      $scope.init = function() {
        $scope.width = window.innerWidth - 30; // col-xs-12 width
        $scope.height = window.innerHeight * 0.8; // row2 height
        context.canvas.width = $scope.width;
        context.canvas.height = $scope.height;
        context.clearRect(0, 0, $scope.width, $scope.height);

        var train = new Image();
        train.onload = function() {
          var ratio = train.naturalHeight / train.naturalWidth;
          var width = $scope.width;
          var height = $scope.width * ratio;
          if (height > $scope.height) {
            width = $scope.height / ratio;
            height = $scope.height;
          }
          context.drawImage(train, ($scope.width - width) / 2, ($scope.height - height) / 2, width, height);
          $timeout(function() {
            $scope.loaded = true;
            $("#control > button:first").click();
          });
        };
        train.src = 'img/train.svg';
      };
    }
  };
});