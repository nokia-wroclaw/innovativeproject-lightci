/**
 * Created by jacek-stachurski on 24.11.14.
 */
'use strict';

angular.module('lightciApp')
  .controller('editProjFormCtrl', function ($scope, $http, $routeParams, $location) {

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

    $scope.project_name = $routeParams.project_name;
    $scope.formData = { project_name: $scope.project_name };
    $scope.formData.scripts = [];
    $scope.formData.deploys = [];
    $scope.formData.artifacts = [];

    function getUsers() {
      $http.put('/api/users', {}).success(function (users) {
        $scope.formData.users = users;
      });
    }

    getUsers();

    $http.get('/api/project', { params: { project_id: $routeParams.project_id } }).success(function (config) {
        $scope.formData.project_name = config.projectName;
        $scope.formData.project_url = config.repositoryUrl;
        $scope.formData.project_repo = config.repositoryType;
        $scope.formData.project_pattern = config.cronePattern;
        $scope.formData.project_usecrone = config.useCrone;
        $scope.formData.project_strategy = config.strategy;
        $scope.formData.project_usedeploy = config.useDeployServer;
        $scope.formData.project_username = config.repositoryUsername;
        $scope.formData.project_password = config.repositoryPassword;
        $scope.formData.project_dependencies = config.dependencies;
        $scope.formData.project_artifact = config.createArtifact;
        $scope.formData.project_notify = config.notifyStrategy;
        $scope.formData.assigned_users = config.assignedUsers;

        for (var i=0; i<config.scripts.length; i++) {
          currentScriptId += 1;
          scriptsNo += 1;
          scriptsVis[i] = false;
          $scope.formData.scripts[i] = {
            scriptId: currentScriptId,
            scriptContent: config.scripts[i].scriptContent,
            parser: config.scripts[i].parser,
            outputPath: config.scripts[i].outputPath
          }
        }

        for (var i=0; i<config.deploys.length; i++) {
          currentDeployId += 1;
          deploysNo += 1;
          deploysVis[i] = false;
          $scope.formData.deploys[i] = {
            serverUsername: config.deploys[i].serverUsername,
            serverPassword: config.deploys[i].serverPassword,
            serverAddress: config.deploys[i].serverAddress,
            deployFilePath: config.deploys[i].deployFilePath,
            scriptContent: config.deploys[i].scriptContent
          }
        }

        for (var i=0; i<config.artifacts.length; i++) {
          currentArtifactId += 1;
          artifactsNo += 1;
          artifactsVis[i] = false;
          $scope.formData.artifacts[i] = {
            artifactId: currentArtifactId,
            artifactPath: config.artifacts[i]
          }
        }
    });

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

    $scope.editProject = function() {

      if ($scope.formData.deploys.length>0)
        $scope.formData.project_usedeploy = true;
      if ($scope.formData.artifacts.length>0)
        $scope.formData.project_artifact = true;

      var data = $scope.formData;

      $http.put('/api/project', data ).success(function (result) {

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

    Array.prototype.swap = function (x,y) {
      var b = this[x];
      this[x] = this[y];
      this[y] = b;
      return this;
    }
  });
