/**
 * Created by jacek-stachurski on 24.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('newProjFormCtrl', function ($scope, $http, $location) {

    $scope.baseUrl = '#'+$location.path();

    var scriptsNo = 0;
    var deploysNo = 0;
    var artifactsNo = 0;
    var scriptsVis = [];
    var deploysVis = [];
    var artifactsVis = [];
    var currentScriptId = 0;
    var currentDeployId = 0;
    var currentArtifactId = 0;

    $scope.formData = {};
    $scope.formData.scripts = [];
    $scope.formData.deploys = [];
    $scope.formData.artifacts = [];

    $scope.addScript = function(i) {
      scriptsNo += 1;
      currentScriptId += 1;
      $scope.formData.scripts.splice(i+1, 0, { scriptId: currentScriptId, scriptContent: '', parser: 'default', outputPath: ''});
      scriptsVis.splice(i+1, 0, true);
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
      if (i < scriptsNo-1) {
        $scope.formData.scripts.swap(i, i + 1);
        scriptsVis.swap(i, i+1);
      }
    }

    $scope.addDeploy = function(i) {
      deploysNo += 1;
      currentDeployId += 1;
      $scope.formData.deploys.splice(i+1, 0, { serverUsername: '', serverPassword: '', serverAddress: '', deployFilePath: '', scriptContent: ''});
      deploysVis.splice(i+1, 0, true);
    }

    $scope.toggleDeploy = function(i) {
      deploysVis[i] = !deploysVis[i];
    }

    $scope.showDeploy = function(i) {
      return deploysVis[i];
    }

    $scope.removeDeploy = function(i) {
      deploysNo -= 1;
      $scope.formData.deploys.splice(i, 1);
      deploysVis.splice(i, 1);
    }

    $scope.addArtifact = function(i) {
      artifactsNo += 1;
      currentArtifactId += 1;
      $scope.formData.artifacts.splice(i+1, 0, { artifactId: currentArtifactId, artifactPath: "" });
      artifactsVis.splice(i+1, 0, true);
    }

    $scope.toggleArtifact = function(i) {
      artifactsVis[i] = !artifactsVis[i];
    }

    $scope.showArtifact = function(i) {
      return artifactsVis[i];
    }

    $scope.removeArtifact = function(i) {
      artifactsNo -= 1;
      $scope.formData.artifacts.splice(i, 1);
      artifactsVis.splice(i, 1);
    }

    function getUsers() {
      $http.put('/api/users', {}).success(function (users) {
        $scope.formData.users = users;
      });
    }

    function getProjects() {
      $http.get('/api/dashboard', {}).success(function (projects) {
        $scope.formData.projects = projects;
      });
    }

    $scope.createProject = function() {

      if ($scope.formData.deploys.length>0)
        $scope.formData.project_usedeploy = true;
      if ($scope.formData.artifacts.length>0)
        $scope.formData.project_artifact = true;

      if ($scope.formData.project_title==='')
        $scope.formData.project_title='AgrippaCI: '+$scope.formData.project_name+' - build failed!';
      if ($scope.formData.project_message==='')
        $scope.formData.project_message='There has been a problem with project: '+$scope.formData.project_name;

      var data = $scope.formData;

      $http.post('/api/project', data).success(function (result) {

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

    $scope.goBack = function() {
      window.history.back();
    }

    getUsers();
    getProjects();

    Array.prototype.swap = function (x,y) {
      var b = this[x];
      this[x] = this[y];
      this[y] = b;
      return this;
    }
  });
