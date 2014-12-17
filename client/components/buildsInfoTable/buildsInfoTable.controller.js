/**
 * Created by jacek-stachurski on 17.11.14.
 */

'use strict';

angular.module('lightciApp')
  .controller('BuildInfoTableCtrl', function ($scope, $http, $routeParams, $location,socket) {
    $scope.build_id = $routeParams.build_id;
    $scope.project_name = $routeParams.project_name;
    $scope.baseUrl = '#'+$location.path();
    getInfo();
    $scope.goBack = function() {
      window.history.back();
    };
    socket.on('project_status',function(data){
      getInfo();
    });
    function getInfo() {
      $http.get('/api/commits', {params: {build_id: $routeParams.build_id}}).success(function (commit) {
        $scope.commits = commit;
      });

      $http.get('/api/outputs', {params: {build_id: $routeParams.build_id}}).success(function (outputs) {
        $scope.outputs = outputs;
      });

      $http.get('/api/deploys',{params: {build_id: $routeParams.build_id}}).success(function (deploys) {
        $scope.deploys = deploys;
      });
    }
  });
