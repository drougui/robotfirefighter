'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('experiment', {
      url: '/experiment',
      template: '<experiment></experiment>'
    });
}
