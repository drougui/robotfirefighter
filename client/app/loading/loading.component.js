'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './loading.routes';

export class LoadingComponent {
  $http;
  socket;
  /*@ngInject*/
  constructor($http, $scope, socket, $interval, $timeout, sharedProperties, $rootScope) {
    'ngInject';
    $scope.playEnabled = false;
    $scope.lostGame = false;
    this.$http = $http;
    this.socket = socket;
    $scope.dot = 0;
    var standBy = false;
    var servercall = $interval(function() { 
      $http.get('/api/auth/gameready').then(response => { // TODO POST TOKEN TO AVOID AN OTHER VISITOR TO GET THE INFORMATION (MAKING THE PLAYER UNABLE TO CLICK)
        if(response.status === 200) {
          //console.log(response.data);
          if(standBy && response.data){
            $scope.lostGame = true;
          }
          if(response.data && !standBy) {
            $scope.playEnabled = true;
            standBy = true;
            //console.log('server informs that game is ready!');
          }
        }
      });
      $scope.dot = ($scope.dot + 1)%4;
    }, 1000);


    $scope.$on("$destroy", function() {
      if (servercall) {
        console.log("SERVERCALL INTERVAL KILL:");
        var cancelServerCall = $interval.cancel(servercall);
        console.log(cancelServerCall);
      }
    });

    var myToken = $rootScope.token; // does nothing, usually $rootScope.token isn't filled yet.
    console.log("LOADING!");
    console.log("$rootScope.token:");
    console.log($rootScope.token);
    console.log("myToken:");
    console.log(myToken);
    
    // LETS PLAY
    $scope.letsplay = function() { 
      myToken = $rootScope.token;
      console.log("letsplay!");
      console.log("myToken:");
      console.log(myToken);
      console.log("$rootScope.token:");
      console.log($rootScope.token);
      
      
      // launch game TODO a mettre au début de main.component.js si ça se lance pas
      console.log("post token to control/launchgame");
      $http.post('/api/control/launchgame', {token: myToken}).then(response => {         
        console.log("letsplay -- control/launchgame -- response: ");   
        console.log(response);
        if(response.status === 200){
          console.log("le token est ok, la partie js du jeu est lancée");
          // kill timeout TODO a mettre au début de main.component.js si ça se lance pas
          console.log("post token to auth/killTimeout");
          $http.post('/api/auth/killtimeout', {token: myToken}).then(response => {      
            console.log("letsplay -- auth/killTimeout -- response: ");
            console.log(response);
            if(response.status === 200){
              console.log("le token est ok, timeout annulé dans auth");
            } else{
              console.log('nok');
            }
          });
        } else{
          console.log('nok');
        }
      });

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
