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

    $scope.buildProject = function(id) {
      var data = { project_id: id };
      $http.post('/api/buildnow', data).success(function () {

      });
    }

    $scope.removeProject = function(id) {
      var data = { project_id: id };
      $http.post('/api/remove', data).success(function () {

      });
    }

  });
