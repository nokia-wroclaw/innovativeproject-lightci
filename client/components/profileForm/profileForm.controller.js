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

    var accountsNo = 0;
    var currentAccountId = 0;
    var accountsVis = [];

    $scope.formData = {};
    $scope.formData.accounts = [];

    $scope.goBack = function() {
      window.history.back();
    }

    $http.get('/api/profile').success(function (user) {
      $scope.formData.email = user.user_email;

      console.log(user);

      for (var i=0; i<user.accounts.length; i++) {
        currentAccountId += 1;
        accountsNo += 1;
        accountsVis[i] = false;
        $scope.formData.accounts[i] = {
          repo_name: user.accounts[i].repo_name,
          repo_address: user.accounts[i].repo_address,
          repo_type: user.accounts[i].repo_type
        }
      }
    });

    $scope.addAccount = function(i) {
      accountsNo += 1;
      currentAccountId += 1;
      $scope.formData.accounts.splice(i+1, 0, { repo_name: '', repo_address: '', repo_type: 'svn'});
      accountsVis.splice(i+1, 0, true);
    }

    $scope.toggleAccount = function(i) {
      accountsVis[i] = !accountsVis[i];
    }

    $scope.showAccount = function(i) {
      return accountsVis[i];
    }

    $scope.removeAccount = function(i) {
      accountsNo -= 1;
      $scope.formData.accounts.splice(i, 1);
      accountsVis.splice(i, 1);
    }

    $scope.saveSettings = function() {
      var data = {
        'email': $scope.formData.email,
        'oldpassword': $scope.formData.oldpassword,
        'newpassword': $scope.formData.newpassword,
        'accounts': $scope.formData.accounts
      };

      $http.put('/api/profile', data).success(function (result) {

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
