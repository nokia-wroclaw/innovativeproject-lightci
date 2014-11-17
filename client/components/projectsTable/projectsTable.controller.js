/**
 * Created by ms on 12.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('ProjTableCtrl', function ($scope, $http, $location) {
    $scope.projects = [];

    $scope.baseUrl = '#';

    $http.get('/api/projects').success(function(proj) {
      $scope.projects = proj;
    });

  });
