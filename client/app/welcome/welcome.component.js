'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './welcome.routes';

export class WelcomeComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('robotfirefighterApp.welcome', [uiRouter])
  .config(routes)
  .component('welcome', {
    template: require('./welcome.html'),
    controller: WelcomeComponent,
    controllerAs: 'welcomeCtrl'
  })
  .name;
