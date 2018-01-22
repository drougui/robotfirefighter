'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './videodemo.routes';

export class VideodemoComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('robotfirefighterApp.videodemo', [uiRouter])
  .config(routes)
  .component('videodemo', {
    template: require('./videodemo.html'),
    controller: VideodemoComponent,
    controllerAs: 'videodemoCtrl'
  })
  .name;
