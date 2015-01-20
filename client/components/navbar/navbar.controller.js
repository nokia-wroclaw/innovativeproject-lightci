'use strict';

angular.module('lightciApp')
  .controller('NavbarCtrl', function ($scope, $http, $location) {

    $scope.isSelected = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
