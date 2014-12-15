/**
 * Created by ms on 12.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('ProjTableCtrl', function ($scope, $http, $location,socket) {
    $scope.projects = [];

    $scope.baseUrl = '#';

    getProjects($scope,$http);

    $scope.buildProject = function (id) {
      var data = {project_id: id};
      $http.post('/api/buildnow', data).success(function () {

      });
    };
    $scope.cancelBuilding = function (id) {
      var data = {project_id: id};

      $http.post('/api/cancelbuilds', data).success(function () {

      });
    };
    $scope.removeProject = function (id) {
      var data = {project_id: id};
      $http.post('/api/remove', data).success(function () {
        $scope.projects = _.filter($scope.projects,function(project){
          return project.id!=id;
        });
      });
    };
    socket.on('project_status',function(data){
      getProjects($scope,$http).then(function(){
      _.find($scope.projects,function(proj){
        return proj.project_name === data.projectName;
      }).progress=data.progress*100;
    });
    });
  });

function getProjects($scope,$http){
  return $http.get('/api/projects').success(function (proj) {
    proj.forEach(function (project) {
      var last = ('lastBuilds' in project)?project.lastBuilds[0]:false;
      var quantityTrue = 0;
      var quantityFalse = 0;
      if('lastBuilds' in project && project.lastBuilds.length>0)
        project.lastBuilds.forEach(function (lastBuild) {
          if (lastBuild==='success') {
            quantityTrue++;
          } else if (lastBuild==='fail'){
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
      else if (quantityTrue == 0 && quantityFalse > 0)
        project.trend = 'verrysad';
      else if (quantityTrue < quantityFalse && quantityFalse > 0)
        project.trend = 'sad';
      else
        project.trend = 'else';

    });
    $scope.projects =  proj;
  });
}
