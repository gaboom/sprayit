var app = angular.module("sprayit", []);

app.controller("SprayController", function($scope, $timeout) {
  var reset = null;

  $scope.reset = function() {
    if (reset) {
      clearTimeout(reset);
    } else {
      $timeout(function(){
        $scope.loading = true;
      });
    }
    reset = setTimeout(function() {
      reset = null;
      $timeout(function(){
        $scope.loading = false;
      });
    }, 500);
  };

  $(window).resize($scope.reset);
});

