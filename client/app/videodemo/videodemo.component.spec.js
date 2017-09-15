'use strict';

describe('Component: VideodemoComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.videodemo'));

  var VideodemoComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    VideodemoComponent = $componentController('videodemo', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
