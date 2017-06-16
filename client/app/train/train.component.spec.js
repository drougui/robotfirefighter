'use strict';

describe('Component: TrainComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.train'));

  var TrainComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    TrainComponent = $componentController('train', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
