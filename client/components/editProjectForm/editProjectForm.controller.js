/**
 * Created by jacek-stachurski on 24.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('editProjFormCtrl', function ($scope, $http, $routeParams, $location) {

    $scope.project_name = $routeParams.project_name;
    $scope.formData = { project_name: $scope.project_name };
    $scope.formData.scripts = [ { scriptContent: "", parser: "default", outputPath: "" } ];

    $scope.baseUrl = '#'+$location.path();

    $http.get('/api/editproject', { params: { project_id: $routeParams.project_id } }).success(function (config) {
        $scope.formData.project_name = config.projectName;
        $scope.formData.project_url = config.repositoryUrl;
        $scope.formData.project_repo = config.repositoryType;
        $scope.formData.project_pattern = config.cronePattern;
        $scope.formData.scripts = config.scripts;
    });

    $scope.editProject = function() {
      var data = $scope.formData;
      $http.post('/api/editproject', data ).success(function (result) {

        if (result.error) {
          $scope.hasError = true;
          $scope.hasInfo = false;
          $scope.message = result.error;
        }

        if (result.info) {
          $scope.hasInfo = true;
          $scope.hasError = false;
          $scope.message = result.info;

          $location.path("#");
        }
      });
    }
  });
