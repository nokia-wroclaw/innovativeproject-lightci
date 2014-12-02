/**
 * Created by jacek-stachurski on 24.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('newProjFormCtrl', function ($scope, $http, $location) {

    $scope.baseUrl = '#'+$location.path();

    var scriptsNo = 0;
    var scriptsVis = [];
    var currentScriptId = 0;

    $scope.formData = {};
    $scope.formData.scripts = [];

    $scope.addScript = function(i) {
      scriptsNo += 1;
      currentScriptId += 1;
      $scope.formData.scripts.splice(i+1, 0, { scriptId: currentScriptId, scriptContent: '', parser: 'default', outputPath: ''});
      scriptsVis[scriptsNo].splice(i+1, 0, true);
    }

    $scope.toggleScript = function(i) {
      scriptsVis[i] = !scriptsVis[i];
    }

    $scope.showScript = function(i) {
      return scriptsVis[i];
    }

    $scope.removeScript = function(i) {
      scriptsNo -= 1;
      $scope.formData.scripts.splice(i, 1);
      scriptsVis.splice(i, 1);
    }

    $scope.moveUpScript = function(i) {
      if (i > 0) {
        $scope.formData.scripts.swap(i, i - 1);
        scriptsVis.swap(i, i-1);
      }
    }

    $scope.moveDownScript = function(i) {
      if (i < scriptsNo) {
        $scope.formData.scripts.swap(i, i + 1);
        scriptsVis.swap(i, i+1);
      }
    }

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

    Array.prototype.swap = function (x,y) {
      var b = this[x];
      this[x] = this[y];
      this[y] = b;
      return this;
    }
  });
