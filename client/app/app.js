'use strict';

angular.module('lightciApp', [
  'highcharts-ng',
  'ngRoute',
  'angular-lodash'

])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'components/projectsTable/projectsTable.html',
        controller: 'ProjTableCtrl'
      })
      .when('/project/:project_id/:project_name', {
        templateUrl: 'components/buildsTable/buildsTable.html',
        controller: 'BuildTableCtrl'
      })
      .when('/project/:project_id/:project_name/build/:build_id', {
        templateUrl: 'components/buildsInfoTable/buildsInfoTable.html',
        controller: 'BuildInfoTableCtrl'
      })
      .when('/project/:project_id/:project_name/build/:build_id/script/:script_id', {
        templateUrl: 'components/scriptInfoTable/scriptInfoTable.html',
        controller: 'ScriptInfoTableCtrl'
      })
      .when('/new', {
        templateUrl: 'components/newProjectForm/newProjectForm.html',
        controller: 'newProjFormCtrl'
      })
      .when('/profile', {
        templateUrl: 'components/profileForm/profileForm.html',
        controller: 'profileFormCtrl'
      })
      .when('/settings', {
        templateUrl: 'components/settingsForm/settingsForm.html',
        controller: 'settingsFormCtrl'
      })
      .when('/project/:project_id/:project_name/edit', {
        templateUrl: 'components/editProjectForm/editProjectForm.html',
        controller: 'editProjFormCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

  });
