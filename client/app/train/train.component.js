'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './train.routes';

export class TrainComponent {
  /*@ngInject*/
  constructor($http, $scope, hotkeys, $interval) {

// TODO TODO TODO TODO setInterval-> $interval
// clear intervals
// rotation roue
// autonomy
// display

    'ngInject';
    

    //hotkeys.add('s', 'tapleft', $scope.faucetctrlfctminus);
    //hotkeys.add('d', 'tapright', $scope.faucetctrlfctplus);
    //hotkeys.add('a', 'pushbutton', $scope.waterPushButton);
    //hotkeys.add('e', 'wrench', $scope.wrenchOnOff);

    hotkeys.add({
      combo: 's',
      description: 'tapleft',
      callback: function() {
        $scope.faucetctrlfctminus();
      }
    });

    hotkeys.add({
      combo: 'd',
      description: 'tapright',
      callback: function() {
        $scope.faucetctrlfctplus();
      }
    });

    hotkeys.add({
      combo: 'a',
      description: 'pushbutton',
      callback: function() {
        $scope.waterPushButton();
      }
    });

    hotkeys.add({
      combo: 'e',
      description: 'wrench',
      callback: function() {
        $scope.wrenchOnOff();
      }
    });


    // water management
    $scope.xrobinet = 42;
    $scope.watlevelContainer = 80; // pourquoi revient-il a zero?
    // constants
    var decal = 4;
    var coeffXrob = 10;
    var constXrob = 50;
    // control of x axis
    $scope.faucetcontrol = 0;
    
    // leaks
    var leakPlacesNb = 9;
    $scope.leakPlaces = [];
    $scope.noleakat = [];
    var leakCounter = 0;
    for (var i=0; i<leakPlacesNb; i++) {
      $scope.leakPlaces.push(leakCounter);
      leakCounter++;
      $scope.noleakat.push(true);
    }


    //=====================================================
    // water management part: 
    //=====================================================
    var pivalue = 3.1415;
    var coeffspeed = 25;
    var faucetxaxis = 2 * 10 / 40;



    var waterManagementInterval = $interval(function() {
      if(($scope.xrobinet <= 80) && ($scope.xrobinet >= 0)) {
        $scope.xrobinet = $scope.xrobinet + coeffspeed * (pivalue / 80) * Math.sin(pivalue * $scope.xrobinet / 40 - pivalue) + $scope.faucetcontrol;
      } else if($scope.xrobinet > 80) {
        $scope.xrobinet = 80;
      } else if($scope.xrobinet < 0) {
          $scope.xrobinet = 0;
      }
      $scope.xrobinetwater = $scope.xrobinet + decal;
      var fxa = ($scope.xrobinet - 40) * 10 / 40;
      faucetxaxis = fxa;
      $scope.yrobinet = coeffXrob * Math.cos(faucetxaxis*3.1415*2 / 20) + constXrob;
    }, 200);



    var waterFlowInterval = $interval(function() {
      var leaksSum = 0;
      for(var i = 0; i<leakPlacesNb; i++) {
        if(!$scope.noleakat[i]){
          leaksSum = leaksSum + 1;
        }
      }
      if((faucetxaxis < 2) && (faucetxaxis > -2) && $scope.watlevelContainer <= 100) {
        $scope.watlevelContainer = $scope.watlevelContainer + $scope.waterwidth*10/7 - leaksSum/(2*leakPlacesNb); 
      } else if ($scope.watlevelContainer > 1){
        $scope.watlevelContainer = $scope.watlevelContainer - leaksSum/leakPlacesNb;
      }
    }, 200);




    $scope.leaksReverse = [];
    $scope.leftValues = [0,0,0,0,0,0,0,0,0];
    var previousNoleakat = [true,true,true,true,true,true,true,true,true]; 
    var leaksInterval = $interval(function() {
      if(Math.random()<0.5) {
        var myInt = Math.floor(Math.random()*leakPlacesNb);
        $scope.noleakat[myInt] = false;
      }
//      console.log(previousNoleakat + " -- " + $scope.noleakat);
      for (var i=0;i<$scope.leakPlaces.length; i++){
//        console.log($scope.noleakat[i] + " -- " + previousNoleakat[i])
        if (!$scope.noleakat[i] && previousNoleakat[i]){
//          console.log("different!");
          if (Math.random()>0.5){
            $scope.leaksReverse[i] = -1;
          } else{
            $scope.leaksReverse[i] = 1;
          }
          $scope.leftValues[i] = Math.random()*30;
          previousNoleakat[i] = $scope.noleakat[i];
        }
      }
    }, 5000);



   // control
    $scope.faucetcontrolShow = 0;
    $scope.direction = 0;
    $scope.animtime = 0;
    $scope.faucetctrlfctplus = function(){
      if($scope.faucetcontrol < 3) {
        $scope.faucetcontrol = $scope.faucetcontrol + 1;
        $scope.faucetcontrolShow = $scope.faucetcontrol;
	if ($scope.faucetcontrol>0){
          $scope.faucetcontrolShow = '+' + $scope.faucetcontrol;
        }
        if($scope.faucetcontrol>0){
          $scope.direction = 1;
        } else if($scope.faucetcontrol<0) {
          $scope.direction = -1;
        } else {
          $scope.direction = 0;
        }
        $scope.animtime = 7 - Math.abs($scope.faucetcontrol)*2;
      }
    }

    $scope.faucetctrlfctminus = function(){
      if($scope.faucetcontrol > -3) {
        $scope.faucetcontrol = $scope.faucetcontrol - 1;
        $scope.faucetcontrolShow = $scope.faucetcontrol;
	if ($scope.faucetcontrol>0){
          $scope.faucetcontrolShow = '+' + $scope.faucetcontrol;
        }
        if($scope.faucetcontrol>0){
          $scope.direction = 1;
        } else if($scope.faucetcontrol<0) {
          $scope.direction = -1;
        } else {
          $scope.direction = 0;
        }
        $scope.animtime = 10 - Math.abs($scope.faucetcontrol)*3;
      }
    }

    var repeater;
    $scope.waterwidth = 0;
    $scope.waterPushButton = function(){
      $scope.waterwidth = 7/10;
      var callCount = 1;
      clearInterval(repeater);
      repeater = setInterval(function () {
        if (callCount < 8) {
          $scope.waterwidth = (7 - callCount)/10;
          callCount += 1;
        } else {
          clearInterval(repeater);
        }
      }, 1000);
    }
    
    $scope.wrenchmodeTrain = false;
    $scope.wrenchOnOff = function(){
      $scope.wrenchmodeTrain = !$scope.wrenchmodeTrain;
      console.log($scope.wrenchmodeTrain);
    }

    $scope.clickLeak = function(leakId) {
      if($scope.wrenchmodeTrain) {
        $scope.noleakat[leakId] = true;
        $scope.wrenchmodeTrain = false;
      }
    };

  }
}

export default angular.module('robotfirefighterApp.train', [uiRouter])
  .config(routes)
  .component('train', {
    template: require('./train.html'),
    controller: TrainComponent,
    controllerAs: 'trainCtrl'
  })
  .name;
