'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('train', {
      url: '/train',
      template: '<train></train>'
    });
}
