'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('welcome', {
      url: '/welcome',
      template: '<welcome></welcome>'
    });
}
