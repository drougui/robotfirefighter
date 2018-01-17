'use strict';

describe('Component: ExperimentComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.experiment'));

  var ExperimentComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    ExperimentComponent = $componentController('experiment', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
