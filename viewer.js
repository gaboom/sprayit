var app = angular.module("sprayit", []);

app.controller("SprayedController", function($scope, $timeout) {
  $scope.src = Math.random() < 0.5 ? "img/train.jpg" : "img/wall.jpg";
  $scope.alt = $scope.src;

  var guard;
  var redraw = function() {
    guard = null;
    var $img = $("#img");
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
  $(window).resize(function() {
    if (guard) {
      clearTimeout(guard);
    }
    guard = setTimeout(redraw, 10);
  });
  $timeout(redraw);
});
