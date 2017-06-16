'use strict';

describe('Component: LoadingComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.loading'));

  var LoadingComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    LoadingComponent = $componentController('loading', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
