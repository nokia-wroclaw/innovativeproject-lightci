/**
 * Created by jacek-stachurski on 25.11.14.
 */

'use strict';

angular.module('lightciApp')
  .controller('ScriptInfoTableCtrl', function ($scope, $http, $routeParams, $location,socket) {
    $scope.script_id = $routeParams.script_id;
    $scope.build_id = $routeParams.build_id;
    $scope.currentSuite = null;
    $scope.showTests = false;

    $scope.baseUrl = '#'+$location.path();

    getScriptDetails($scope,$http);

    $scope.goBack = function() {
      window.history.back();
    };


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
    };

    socket.on('console_update',function(data){
      getScriptDetails($scope,$http);
    });

    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "bar",
          backgroundColor:"#000"
        },
        "plotOptions": {
          "series": {
            "stacking": ""
          }
        }
      },
      "series": [
        {
          "name": "Passed",
          "data": [],
          "connectNulls": false,
          "id": "series-1",
          "type": "column",
          "dashStyle": "LongDashDotDot",
          color:'green'
        },
        {
          "name": "Failures",
          "data": [],
          "connectNulls": false,
          "id": "series-2",
          "type": "column",
          "dashStyle": "LongDashDotDot",
          color:'orange'
        },

        {
          "name": "Skipped",
          "data": [],
          "connectNulls": false,
          "id": "series-4",
          "type": "column",
          "dashStyle": "LongDashDotDot",
          color:'gray'
        },
        {
          "name": "Errors",
          "data": [],
          "connectNulls": false,
          "id": "series-3",
          "type": "column",
          "dashStyle": "LongDashDotDot",
          color:'red'
        }
      ],
      "title": {
        "text": "Tests summary"
      },
      "credits": {
        "enabled": false
      },
      "loading": false,
      "size": {},
      yAxis: {
        allowDecimals:false,
        currentMin: 0,
        minTickInterval: 1

      }

    };
    function getScriptDetails($scope,$http){
      var allTests = 0,
        allErrors= 0,
        allFailure = 0,
        allSkipped= 0,
        allPassed=0;

      $http.get('/api/scriptdetails', { params: { script_id: $routeParams.script_id } }).success(function(script) {
        $scope.scriptDetails = script;
        script.testSuites.forEach(function(suite){
          allTests+=suite.tests;
          allErrors+=suite.errors;
          allFailure+=suite.failures;
          allSkipped+=suite.skipped;
        });
        allPassed=allTests-allFailure-allSkipped;
        $scope.chartConfig.series[0].data.push(allPassed);
        $scope.chartConfig.series[1].data.push(allFailure);
        $scope.chartConfig.series[2].data.push(allSkipped);
        $scope.chartConfig.series[3].data.push(allErrors);

        if(script.testSuites.length>0){
          $scope.show = true;
        } else {
          $scope.show = false;

        }

      });

    }
  });


