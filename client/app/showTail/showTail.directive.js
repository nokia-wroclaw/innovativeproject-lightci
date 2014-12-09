'use strict';

angular.module('lightciApp')
  .directive('showTail', function () {
    return function(scope, elem) {
      scope.$watch(function () {
          return _.first(elem).value;
        },
        function() {
          _.first(elem).scrollTop = elem[0].scrollHeight;
        });
    }
  });
