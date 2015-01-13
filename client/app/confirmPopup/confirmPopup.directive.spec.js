'use strict';

describe('Directive: confirmPopup', function () {

  // load the directive's module and view
  beforeEach(module('lightciApp'));
  beforeEach(module('app/confirmPopup/confirmPopup.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<confirm-popup></confirm-popup>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the confirmPopup directive');
  }));
});