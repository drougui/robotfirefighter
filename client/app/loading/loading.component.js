'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './loading.routes';

export class LoadingComponent {
  $http;
  socket;
  /*@ngInject*/
  constructor($http, $scope, socket, $interval, $timeout, sharedProperties) {
    'ngInject';
    $scope.playEnabled = false;
    this.$http = $http;
    this.socket = socket;
    var newTokenTimeout;
    var servercall = $interval(function() {
      $http.get('/api/control/gameready').then(response => {
        if(response.status === 200) {
          console.log(response.data);
          if(response.data) {
            $scope.playEnabled = true;
            console.log('yooooooooooooooooooooooooooooooooooooooooooo!!!');
             newTokenTimeout = $timeout(function() {
               // TODO NEW TOKEN !!!!! place libre! EST-CE QUE CA SUFFIT QUE CA SOIT LE COTE CLIENT QUI DESACTIVE? 
		//NON! le compteur sera dans "auth", et il continue tant qu'il ne reçoit rien
		// avec une limite maximale de 11min
               
             }, 30000);
          }
        }
      });
    }, 1000);
    $scope.$on("$destroy", function() {
        if (servercall) {
            $interval.cancel(servercall);
        }
    });

    $scope.letsplay = function() {
      $http.get('/api/control/launchgame').then(response => {
        console.log(response);
        if(response.status === 200){
		// TODO kill timeout
        }
      })
    }
  }

/*
  $scope.letsplay = function() {
    $http.get('/api/control/launchgame').then(response => {
        console.log(response);
        if(response.status === 200){
		
        }
    })
  }
*/
}

export default angular.module('robotfirefighterApp.loading', [uiRouter])
  .config(routes)
  .component('loading', {
    template: require('./loading.html'),
    controller: LoadingComponent,
    controllerAs: 'loadingCtrl'
  })
  .name;
