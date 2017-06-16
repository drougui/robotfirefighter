'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('howto', {
      url: '/howto',
      template: '<howto></howto>'
    });
}
