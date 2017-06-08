'use strict';

describe('Component: WelcomeComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.welcome'));

  var WelcomeComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    WelcomeComponent = $componentController('welcome', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
