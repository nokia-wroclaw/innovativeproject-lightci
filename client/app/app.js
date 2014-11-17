'use strict';

angular.module('lightciApp', [

  'ngRoute'
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
      .otherwise({
        redirectTo: '/'
      });

  });
