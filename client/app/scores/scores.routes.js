'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('scores', {
      url: '/scores',
      template: '<scores></scores>'
    });
}
