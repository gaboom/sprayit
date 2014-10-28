var app = angular.module("sprayit", []);

app.controller("SprayController", function($scope, $timeout) {
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  function init() {
    $content = $("#content");
    context.canvas.width = $content.width();
    context.canvas.height = $content.height();
    context.strokeStyle = 'blue';
    context.lineWidth = '5';
    context.strokeRect(0, 0, context.canvas.width, context.canvas.height);
  }

  var reset = null;
  $scope.reset = function() {
    if (reset) {
      clearTimeout(reset);
    } else {
      $timeout(function(){
        $scope.loaded = false;
      });
    }
    reset = setTimeout(function() {
      reset = null;
      init();
      $timeout(function(){
        $scope.loaded = true;
      });
    }, 500);
  };
  $(window).resize($scope.reset);

  init();
  $scope.loaded = true;
});

