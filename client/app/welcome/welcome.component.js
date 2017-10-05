'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './welcome.routes';

export class WelcomeComponent {
  /*@ngInject*/
  constructor($http, $scope, socket, sharedProperties, $rootScope, $interval) {
    'ngInject';
    this.$http = $http;
    this.socket = socket;
    //this.$scope = $scope;
    var debug = false;


    // get remaining time
    var remainingTimeInterval = $interval(function() {
      $http.get('/api/control/time').then(response => {
        if(response.status === 200) {
          $scope.remainingtime = response.data;
        }
      });
      // display the appropriate interface? // WARNING!!! MIS LA POUR QUE EMPTYSLOT SE METTE A JOUR (pas testé)
      $http.get('/api/auth').then(response => {
        if(debug){
          console.log(response);
          console.log("emptySlot:")
          console.log(response.data);
        }
        $scope.emptySlot=response.data;
      });
    }, 1000);
    $scope.$on("$destroy", function() {
      if (remainingTimeInterval) {
        $interval.cancel(remainingTimeInterval);
      }
    });

    // test authorization for playing
    // var token = "";
    $rootScope.token = "";
    var myToken = $rootScope.token;
    $scope.play = function(){
      $http.get('/api/auth/play').then(response => {
        if(debug){
          console.log("response!")
          console.log(response);
        }
        if(response.status === 200){
          if(debug){
            console.log("give token");
          }
          // ok, I give a token to you
          $rootScope.token = response.data;
          myToken = $rootScope.token;
          if(debug){
            console.log("welcome - play() -- I JUST GOT A TOKEN: ");
            console.log($rootScope.token);
            console.log("welcome - play() -- myToken : ");
            console.log(myToken);
          }
          // launch MORSE & co
          $http.post('/api/control/start', {token: myToken}).then(response => {
            if(debug){
              console.log("control/start response:");
              console.log(response);
            }
            if(response.status === 200){
              if(debug){  
                console.log("game launched!");
              }
            }
            else if(debug){
              console.log("game not launched");
            }
          });
        }
        else{
          // no token, display appropriate home
          $scope.emptySlot=false;
          if(debug){
            console.log("no token available!");
          }
        }
      })
    }; // play
  } // constructor
} // component

export default angular.module('videogameApp.welcome', [uiRouter])
  .config(routes)
  .component('welcome', {
    template: require('./welcome.html'),
    controller: WelcomeComponent,
    controllerAs: 'welcomeCtrl'
  })
  .name;
