/**
 * Created by jacek-stachurski on 24.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('newProjFormCtrl', function ($scope, $http, $location) {

    $scope.baseUrl = '#'+$location.path();

    $scope.formData = {};
    $scope.formData.scripts = [ { scriptContent: "", parser: "default" } ];

    $scope.createProject = function() {
      var data = $scope.formData;
      $http.post('/api/create', data).success(function (result) {

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
