'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './scores.routes';

export class ScoresComponent {
  /*@ngInject*/
  constructor($scope,$http) {
    'ngInject';
    $http.get('/api/control/scores').then(response => {
      if(response.status === 200) {
        $scope.currentScores = JSON.parse(response.data);
      }
    });
    this.message = 'Hello';
  }
}

export default angular.module('robotfirefighterApp.scores', [uiRouter])
  .config(routes)
  .component('scores', {
    template: require('./scores.html'),
    controller: ScoresComponent,
    controllerAs: 'scoresCtrl'
  })
  .name;
