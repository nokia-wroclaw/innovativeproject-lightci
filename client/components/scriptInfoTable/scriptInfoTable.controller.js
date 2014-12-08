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
        allPassed=allTests-allErrors-allFailure-allSkipped;
        $scope.chartConfig.series[0].data.push(allPassed);
        $scope.chartConfig.series[2].data.push(allErrors);
        $scope.chartConfig.series[1].data.push(allFailure);
        $scope.chartConfig.series[3].data.push(allSkipped);
        if(script.testSuites.length>0){
          $scope.show = true;
        } else {
          $scope.show = false;

        }

    });

    $scope.goBack = function() {
      window.history.back();
    }

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
          "dashStyle": "LongDashDotDot"
        },
        {
          "name": "Failures",
          "data": [],
          "connectNulls": false,
          "id": "series-2",
          "type": "column",
          "dashStyle": "LongDashDotDot"
        },
        {
          "name": "Errors",
          "data": [],
          "connectNulls": false,
          "id": "series-3",
          "type": "column",
          "dashStyle": "LongDashDotDot"
        },
        {
          "name": "Skipped",
          "data": [],
          "connectNulls": false,
          "id": "series-4",
          "type": "column",
          "dashStyle": "LongDashDotDot"
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
      xAxis: {
        currentMin: 0,
        step:1
      }

    }
  });
