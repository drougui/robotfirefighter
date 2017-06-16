'use strict';

describe('Component: HowtoComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.howto'));

  var HowtoComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    HowtoComponent = $componentController('howto', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
