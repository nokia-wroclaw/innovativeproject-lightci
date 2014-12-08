/**
 * Created by jacek-stachurski on 17.11.14.
 */

'use strict';

angular.module('lightciApp')
  .controller('BuildInfoTableCtrl', function ($scope, $http, $routeParams, $location) {
    $scope.build_id = $routeParams.build_id;
    $scope.project_name = $routeParams.project_name;

    $scope.baseUrl = '#'+$location.path();

    $http.get('/api/commits', { params: { build_id: $routeParams.build_id } }).success(function(commit) {
      $scope.commits = commit;
    });

    $http.get('/api/outputs', { params: { build_id: $routeParams.build_id } }).success(function(outputs) {
      $scope.outputs = outputs;
    });

    $scope.goBack = function() {
      window.history.back();
    }
  });
