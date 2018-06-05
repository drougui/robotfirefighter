'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('etcalib', {
      url: '/etcalib',
      template: '<etcalib></etcalib>'
    });
}
