'use strict';

describe('Component: EtcalibComponent', function() {
  // load the controller's module
  beforeEach(module('robotfirefighterApp.etcalib'));

  var EtcalibComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    EtcalibComponent = $componentController('etcalib', {});
  }));

  it('should ...', function() {
    expect(1).toEqual(1);
  });
});
