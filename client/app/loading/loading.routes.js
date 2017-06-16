'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('loading', {
      url: '/loading',
      template: '<loading></loading>'
    });
}
