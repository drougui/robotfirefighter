'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './about.routes';

export class AboutComponent {
  /*@ngInject*/
//  $scope;
//  controller: AboutComponent;
//  AboutComponent.$inject = ['$scope'];

// https://github.com/angular-fullstack/generator-angular-fullstack/issues/2330
  constructor($http,$scope,socket) {
    'ngInject';
    this.$http = $http;
    this.socket = socket;
  
  }

}



export default angular.module('robotfirefighterApp.about', [uiRouter])
  .config(routes)
  .component('about', {
    template: require('./about.html'),
    controller: AboutComponent,
    controllerAs: 'aboutCtrl'
  })
  .name;
