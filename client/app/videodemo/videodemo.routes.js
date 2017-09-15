'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('videodemo', {
      url: '/videodemo',
      template: '<videodemo></videodemo>'
    });
}
