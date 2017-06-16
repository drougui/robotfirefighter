'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './welcome.routes';

export class WelcomeComponent {
  /*@ngInject*/
  constructor($http, $scope, socket, sharedProperties) {
    'ngInject';
    this.$http = $http;
    this.socket = socket;

    // display the appropriate interface?
    $http.get('/api/auth').then(response => {
      console.log(response);
      $scope.emptySlot=response.data;
      console.log("emptySlot:")
      console.log(response.data);
    })

    // test authorization for playing
    var token = "";
    $scope.play = function(){
      $http.get('/api/auth/play').then(response => {
        console.log("response!")
        console.log(response);
        if(response.status === 200){
          console.log("give token");
          // ok, I give a token to you
          token=response.data;
          sharedProperties.setProperty(token);
          // and I launch the videogame
          $http.get('/api/control/start').then(response => {
            console.log(response);
            if(response.status === 200){
              console.log("game launched!");
            }
            else{
              console.log("game not started");
            }
          })
        }
        else{
          // no token, display appropriate home
          $scope.emptySlot=false;
          console.log("no token!")
        }
      })
    }

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
