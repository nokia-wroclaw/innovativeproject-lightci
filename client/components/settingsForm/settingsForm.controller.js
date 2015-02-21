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
    $scope.restore = false;

    getConfigs();

    $scope.formData = {};
    $scope.plugins = [
      { "name": "UberPlugin-1.0.3", "active": true },
      { "name": "MegaPlugin-2.0.0", "active": false },
      { "name": "MercurialRepo2", "active": true }
    ];

    $scope.goBack = function() {
      window.history.back();
    }

    function getConfigs() {
      $http.get('/api/configs').success(function (cfgs) {
        $scope.cfgs = cfgs;
        $scope.formData.queue_max = cfgs[cfgs.length-1].maxBuildingProjects;
        $scope.formData.email_service = cfgs[cfgs.length-1].notifierService;
        $scope.formData.email_login = cfgs[cfgs.length-1].notifierUser;
        $scope.formData.email_pass = cfgs[cfgs.length-1].notifierPass;
      });
    };

    $scope.restoreConfig = function(id) {
      var data = { id: id };
      $http.post('/api/configs', data).success(function (result) {
        if (result.success) {
          $location.path("#");
        } else {
          $scope.hasError = true;
          $scope.message = result.message;
        }
      });
    };

    $scope.saveSettings = function() {
      var data = {
        queue_max: $scope.formData.queue_max,
        email_service: $scope.formData.email_service,
        email_login: $scope.formData.email_login,
        email_pass: $scope.formData.email_pass
      };
      $http.put('/api/configs', data).success(function (result) {
        if (result.success) {
          $location.path("#");
        } else {
          $scope.hasError = true;
          $scope.message = result.message;
        }
      });
    }
  });
