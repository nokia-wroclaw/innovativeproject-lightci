/**
 * Created by ms on 12.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('ProjTableCtrl', function ($scope, $http, $location, socket, $interval) {
    var intervals = [];
    $scope.projects = [];
    $scope.queue = [];

    $scope.baseUrl = '#';

    $scope.isQEmpty = function(){
      return $scope.queue.length > 0 ? false : true;
    }

    function getQueue() {
      $http.get('/api/buildQueues').success(function (queue) {
        $scope.queue = queue;
      });
    };

    getQueue();

    getProjects($scope, $http, $interval).then(function () {

    });

    $scope.buildProject = function (id) {
      var data = {project_id: id};
      $http.post('/api/builds', data).success(function () {

      });
    };
    $scope.cancelBuilding = function (id) {
      var data = {project_id: id};
      $http.put('/api/builds', data).success(function () {

      });
    };
    $scope.removeProject = function (id) {
    var data = {project_id: id};
      $http.put('/api/dashboard', data).success(function () {
        $scope.projects = _.filter($scope.projects, function (project) {
          return project.id != id;
        });
      });
    };
    socket.on('project_status', function (data) {

      var project = _.find($scope.projects, function (proj) {
        return proj.project_name === data.projectName;
      });
      if (_.first(project.lastBuilds) == 'pending' && data.status == 'pending') {
        if (!("lastBuildTime" in project))
          project.progress = data.progress * 100;
      } else {
        project.lastBuilds.unshift(data.status);
        if (project.lastBuilds.length > 5)
          project.lastBuilds.pop();
        project.isPending = _.first(project.lastBuilds) == 'pending';
        project.lastBuildTime = new Date();
        project.progress = 0;
        updateProgress(project);

        calculateTrend(project);
      }

    });

    socket.on('build_queue_change', function (data) {
      switch(data.change){
        case 'remove':
          $scope.queue = _.filter($scope.queue,function(proj){
          return proj !== data.projectName;
        });
          break;
        case 'add':
          $scope.queue.push(data.projectName);
          break;
      }



    });
    function getProjects($scope, $http, $interval) {
      return $http.get('/api/dashboard').success(function (proj) {
        proj.forEach(function (project) {
          calculateTrend(project);
        });
        $scope.projects = proj;
        _.each($scope.projects, function (proj) {
          if (proj.lastBuilds.length > 0)
            proj.isPending = _.first(proj.lastBuilds) == 'pending';
          else
            proj.isPending = false;
        });

        _.each($scope.projects, updateProgress, [proj]);
      });

    }

    function updateProgress(proj) {
      if ("lastBuildTime" in proj && proj.isPending) {
        intervals[proj.project_name] = [];
        intervals[proj.project_name].push($interval(function (project) {
          var currentDate = new Date().getTime();
          var avgDate = new Date(project.project_average_build_time).getTime();
          var buildTime = new Date(project.lastBuildTime).getTime();
          var progress = (currentDate - buildTime) / avgDate * 100;
          project.progress = progress;
          if (project.progress > 99) {
            project.progress = 99;
            _.each(intervals[project.project_name], function (interval) {
              $interval.cancel(interval);
            });
          }
        }.bind(null, proj), 1000));
      }
    }

    function calculateTrend(project) {
      var last = ('lastBuilds' in project) ? project.lastBuilds[0] : false;
      var quantityTrue = 0;
      var quantityFalse = 0;
      if ('lastBuilds' in project && project.lastBuilds.length > 0)
        project.lastBuilds.forEach(function (lastBuild) {
          if (lastBuild === 'success') {
            quantityTrue++;
          } else if (lastBuild === 'fail') {
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
    }
  });
