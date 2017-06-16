'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './howto.routes';

export class HowtoComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('robotfirefighterApp.howto', [uiRouter])
  .config(routes)
  .component('howto', {
    template: require('./howto.html'),
    controller: HowtoComponent,
    controllerAs: 'howtoCtrl'
  })
  .name;
