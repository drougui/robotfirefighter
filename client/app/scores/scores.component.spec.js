'use strict';

describe('Component: ScoresComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.scores'));

  var ScoresComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ScoresComponent = $componentController('scores', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
