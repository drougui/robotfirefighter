'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './train.routes';

export class TrainComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('robotfirefighterApp.train', [uiRouter])
  .config(routes)
  .component('train', {
    template: require('./train.html'),
    controller: TrainComponent,
    controllerAs: 'trainCtrl'
  })
  .name;
