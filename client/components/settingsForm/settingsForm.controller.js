/**
 * Created by krysiu-ibisz on 1/6/15.
 */
'use strict';

angular.module('lightciApp')
  .controller('settingsFormCtrl', function ($scope, $http, $location) {

    $scope.baseUrl = '#' + $location.path();
    $scope.hasError = false;
    $scope.hasInfo = false;
    $scope.message = "";

    $scope.formData = {};
    $scope.plugins = [
      { "name": "UberPlugin-1.0.3", "active": true },
      { "name": "MegaPlugin-2.0.0", "active": false },
      { "name": "MercurialRepo2", "active": true }
    ];

    $scope.goBack = function() {
      window.history.back();
    }

    $scope.saveSettings = function() {
      var data = {};
      $http.post('/api/settings', data).success(function (result) {

      });
    }
  });
