/**
 * Created by jacek-stachurski on 24.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('editProjFormCtrl', function ($scope, $http, $routeParams, $location) {

    $scope.project_name = $routeParams.project_name;
    $scope.formData = { project_name: $scope.project_name };

    $scope.baseUrl = '#'+$location.path();

    $scope.editProject = function() {
      var data = $scope.formData;
      $http.post('/api/edit', data).success(function () {
      });
    }
  });
