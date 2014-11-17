/**
 * Created by jacek-stachurski on 17.11.14.
 */

'use strict';

angular.module('lightciApp')
  .controller('BuildInfoTableCtrl', function ($scope, $http, $routeParams, $location) {
    $scope.build_id = $routeParams.build_id;
    $scope.project_name = $routeParams.project_name;

    $scope.baseUrl = '#'+$location.path();
/*
    $http.get('/api/builds', { params: { project_id: $routeParams.project_id } }).success(function(build) {
      $scope.builds = build;
    });
*/
  });
