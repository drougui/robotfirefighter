'use strict';

export default function routes($stateProvider) {
  'ngInject';
  $stateProvider.state('game', {
    url: '/game',
    template: '<game></game>'
  });
}
