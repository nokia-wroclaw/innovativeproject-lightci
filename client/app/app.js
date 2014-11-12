'use strict';

angular.module('lightciApp', [

  'ngRoute'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'components/projectsTable/projectsTable.html',
        controller: 'ProjTableCtrl'
      }).otherwise({
        redirectTo: '/'
      });

  });
