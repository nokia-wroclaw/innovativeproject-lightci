'use strict';

angular.module('lightciApp')
  .directive('confirmPopup', function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {  title: '@', content: '@',id: '@', placement: '@', animation: '&', isOpen: '&' ,func:'&'},
      templateUrl: 'app/confirmPopup/confirmPopup.html',
      link: function ($scope, element, attrs) {
        $scope.confirm = function(){
          var id = $scope.$parent.$parent.project.id;
          //$scope.$parent.$parent.$parent.removeProject(id);
          //$scope.$parent.tt_isOpen = false;
          $scope.func();
        };
        $scope.cancel = function(){
          $scope.$parent.tt_isOpen = false;
        };
      }
    };
  })
  .directive( 'confirm', [ '$tooltip', function ($tooltip) {
    return $tooltip( 'confirm', 'confirm', 'click' );
  }]);
