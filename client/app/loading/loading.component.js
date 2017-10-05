'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './loading.routes';

export class LoadingComponent {
  $http;
  socket;
  /*@ngInject*/
  constructor($http, $scope, socket, $interval, $timeout, sharedProperties, $rootScope, $window) {
    'ngInject';
    $scope.user = {};
    $scope.user.pseudo = "";
    var myToken = $rootScope.token; // does nothing, usually $rootScope.token isn't filled yet.
    $scope.playEnabled = false;
    $scope.lostGame = false;
    this.$http = $http;
    this.socket = socket;
    $scope.dot = 0;
    var debug = false;
    var servercall = $interval(function() {
      myToken = $rootScope.token;
      if(debug){
        console.log("$rootScope.token");
        console.log($rootScope.token);
      }
      $http.post('/api/auth/gameready', {token: myToken}).then(response => {  //POST TOKEN TO AVOID AN OTHER VISITOR TO GET THE INFORMATION (MAKING THE PLAYER UNABLE TO CLICK)
        if(response.status === 200) {
          if(debug){
            console.log(response.data.isgameready);
            console.log(response.data.istoolate);
          }
          if(response.data.isgameready || $scope.playEnabled){
            $scope.playEnabled = true;
          }
          if(response.data.istoolate || $scope.lostGame) {
            $scope.lostGame = true;
            $scope.playEnabled = false;  
          }
        }
      });
      $scope.dot = ($scope.dot + 1)%4;
      console.log("LOADING VARIABLES");
      console.log("$scope.lostGame");
      console.log($scope.lostGame);
      console.log("$scope.playEnabled");
      console.log($scope.playEnabled);
      if($scope.playEnabled){
        $http.post('/api/control/pseudobegin', {pseudo: $scope.user.pseudo, token: myToken}).then(response => { // sans token, pas secure!
          if(response.status === 200) {
            console.log($scope.user.pseudo);
            console.log("!!!!!!! new pseudo sent !!!!!!!!");
          }else{
            console.log('nok pseudo');
          }
        });
      }
    }, 1000);


    $scope.$on("$destroy", function() {
      if (servercall) {
        var cancelServerCall = $interval.cancel(servercall);
        if(debug){
          console.log("SERVERCALL INTERVAL KILL:");
          console.log(cancelServerCall);
        }
      }
    });

    if(debug){
      console.log("LOADING!");
      console.log("$rootScope.token:");
      console.log($rootScope.token);
      console.log("myToken:");
      console.log(myToken);
    }
    // LETS PLAY
    $scope.letsplay = function() { 
      myToken = $rootScope.token;
      if(debug){
        console.log("letsplay!");
        console.log("myToken:");
        console.log(myToken);
        console.log("$rootScope.token:");
        console.log($rootScope.token);
      }
      
      // launch game TODO a mettre au début de main.component.js si ça se lance pas
      if(debug){
        console.log("post token to control/launchgame");
      }
      $http.post('/api/control/launchgame', {token: myToken}).then(response => {
        if(debug){
          console.log("letsplay -- control/launchgame -- response: ");   
          console.log(response);
        }
        if(response.status === 200){
          if(debug){
            console.log("le token est ok, la partie js du jeu est lancée");
          // kill timeout TODO a mettre au début de main.component.js si ça se lance pas
            console.log("post token to auth/killTimeout");
          }
          $http.post('/api/auth/killtimeout', {token: myToken}).then(response => {
            if(debug){
              console.log("letsplay -- auth/killTimeout -- response: ");
              console.log(response);
            }
            if(response.status === 200){
              if(debug){
                console.log("le token est ok, timeout annulé dans auth");
              }
            } else if(debug){
              console.log('nok');
            }
          });
        } else if(debug){
          console.log('nok');
        }
      });

    }



    $scope.reload = function() {
      $timeout(function() {
        $window.location.reload();
      }, 500);
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
