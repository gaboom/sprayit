var app = angular.module("sprayit", []);

app.controller("SprayController", function($scope, $timeout) {
  $timeout(function(){
    $scope.reset();
  });
});

app.factory("SparyService", function() {
  return {
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
      $scope.init = function() {
        // elements not visible at this moment, estimate size
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
          context.drawImage(train, ($scope.width-width)/2, ($scope.height-height)/2, width, height);
          $timeout(function(){
            $scope.loaded = true;
          });
        };
        train.src = 'img/train.svg';
      };
    }
  };
});