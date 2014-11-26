/**
 * Created by jacek-stachurski on 25.11.14.
 */

'use strict';

angular.module('lightciApp')
  .controller('ScriptInfoTableCtrl', function ($scope, $http, $routeParams, $location) {
    $scope.script_id = $routeParams.script_id;
    $scope.build_id = $routeParams.build_id;
    $scope.currentSuite = null;
    $scope.showTests = false;

    $scope.baseUrl = '#'+$location.path();

    $http.get('/api/scriptdetails', { params: { script_id: $routeParams.script_id } }).success(function(script) {
      $scope.scriptDetails = script;
    });

    $scope.getTests = function(suite) {
      if ($scope.showTests == false) {
        $http.get('/api/tests', {params: {suite_id: suite.id}}).success(function (tests) {
          $scope.suiteTests = tests;
          $scope.currentSuite = suite;
        });
        $scope.showTests = true;
      } else {
        $scope.suiteTests = null;
        $scope.currentSuite = null;
        $scope.showTests = false;
      }
    }
  });
