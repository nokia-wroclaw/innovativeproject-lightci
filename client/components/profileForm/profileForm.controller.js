/**
 * Created by root on 12/16/14.
 */
'use strict';

angular.module('lightciApp')
  .controller('profileFormCtrl', function ($scope, $http, $location) {

    $scope.baseUrl = '#' + $location.path();
    $scope.hasError = false;
    $scope.hasInfo = false;
    $scope.message = "";

    $scope.formData = {};

    $scope.goBack = function() {
      window.history.back();
    }

    $http.get('/api/profile').success(function (user) {
      $scope.formData.email = user.user_email;
    });

    $scope.saveSettings = function() {
      var data = {
        'email': $scope.formData.email,
        'notifications': $scope.formData.notifications,
        'oldpassword': $scope.formData.oldpassword,
        'newpassword': $scope.formData.newpassword
      };

      $http.post('/api/profile', data).success(function (result) {

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

        //$scope.hasInfo = true;
        //$scope.message = "POST SUCCESSFUL";
      });
    }
  });
