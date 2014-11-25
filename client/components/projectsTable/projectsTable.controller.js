/**
 * Created by ms on 12.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('ProjTableCtrl', function ($scope, $http, $location) {
    $scope.projects = [];

    $scope.baseUrl = '#';

    $http.get('/api/projects').success(function (proj) {
      proj.forEach(function (project) {
        var last = project.lastBuilds[0];
        var quantityTrue = 0;
        var quantityFalse = 0;
        project.lastBuilds.forEach(function (lastBuild) {
          if (lastBuild) {
            quantityTrue++;
          } else {
            quantityFalse++;
          }
        });
        if (quantityTrue == 1 && quantityFalse > 0 && last == true)
          project.trend = 'love';
        else if (quantityFalse == 1 && quantityTrue > 0 && last == false)
          project.trend = 'suprise';
        else if (quantityTrue > 0 && quantityFalse == 0)
          project.trend = 'verryhappy';
        else if (quantityTrue > quantityFalse && quantityFalse > 0)
          project.trend = 'happy';
        else if (quantityTrue < quantityFalse && quantityFalse > 0)
          project.trend = 'sad';
        else if (quantityTrue == 0 && quantityFalse > 0)
          project.trend = 'verrysad';
        else
          project.trend = 'else';

      });
      $scope.projects = proj;
    });

    $scope.buildProject = function (id) {
      var data = {project_id: id};
      $http.post('/api/buildnow', data).success(function () {

      });
    };

    $scope.removeProject = function (id) {
      var data = {project_id: id};
      $http.post('/api/remove', data).success(function () {

      });
    }

  });
