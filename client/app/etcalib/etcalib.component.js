'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './etcalib.routes';

export class EtcalibComponent {
  /*@ngInject*/
  constructor($scope, $http, $rootScope, $interval) {
    'ngInject';
    this.$http = $http;
    var debug = false;
    this.message = 'Hello';

    // get zones locations from json file
    var zoneslocations;
    $scope.zones = [];
    $scope.zones[0] = {x:'20%', y: '10%'};
    $scope.zones[1]= {x: '30%', y: '40%'};
    $http.get('/api/control/zones').then(response => {
      console.log("$http.get");
      if(response.status === 200) {
        zoneslocations = JSON.parse(response.data);
        $scope.zones = zoneslocations;
        for(var i = 0; i < zoneslocations.length; i++) {
          var xValz = $scope.realToCssPoseX(parseFloat(zoneslocations[i].x));
          var yValz = $scope.realToCssPoseY(parseFloat(zoneslocations[i].y));
          $scope.zones[i].x = xValz;
          $scope.zones[i].y = yValz;
          console.log("ZONES:")
          console.log($scope.zones[i].x);
          console.log($scope.zones[i].y);
        }
      } else{
        console.log("response status error");
        console.log(response.status);
      }
      console.log("COUCOU");
      console.log($scope.zones);
    });





        // get trees locations from json file
    var treeslocations;
    $scope.trees = [];
    $scope.firesloc = [];
    $scope.opacityfire = [];
    $http.get('/api/control').then(response => {
      if(response.status === 200) {
        treeslocations = JSON.parse(response.data);
        $scope.trees = treeslocations;
        for(var i = 0; i < treeslocations.length; i++) {
          var xVal = $scope.realToCssPoseX(parseFloat(treeslocations[i].x));
          var yVal = $scope.realToCssPoseY(parseFloat(treeslocations[i].y));
          $scope.trees[i].x = xVal;
          $scope.trees[i].y = yVal;
          $scope.firesloc.push({x: xVal, y: (parseFloat(yVal.slice(0, -1)) - 3.8).toString() + '%'});
          $scope.opacityfire.push(0);
          console.log("trees:")
          console.log($scope.trees[i].x);
          console.log($scope.trees[i].y);
        }
        $scope.opacityfire[3] = 1;
        $scope.opacityfire[8] = 1;
        $scope.opacityfire[5] = 1;
        $scope.opacityfire[1] = 1;
      }
    });

    
    // map management functions/params
    var translationX = 19;
    var normalizationX = 38;
    var translationY = 19;
    var normalizationY = 38;
    $scope.realToCssPoseX = function(realPose) {
      return (-5 + (realPose + translationX) * 100.0 / normalizationX).toString() + '%';
    };
    $scope.realToCssPoseY = function(realPose) {
      return (95 - (realPose + translationY) * 100.0 / normalizationY).toString() + '%';
    };

    $scope.firstPump = 2;
    $scope.watlevel = 50;
    $scope.xrobinet = 45;
    $scope.watlevelContainer = 50; 
    $scope.watlevelContainerMap = 50; 
    $scope.xrobinetwater = 49;
    $scope.faucetxaxis = 20;
    $scope.yrobinet = 60;
    $scope.waterwidth = 0.5;
    $scope.battlevel = 50;
    $scope.autonomous = 0;
    $scope.mercurelevel = "25%";
    $scope.nbfighted = 5;
    $scope.remainingtime = 257;
    $scope.language = $rootScope.language || 'english';


    $scope.propFromLeft = '10%';
    $scope.propFromTop = '30%';

    $scope.AOI = 0;
    var AOIInterval = $interval(function() {
      $http.get('/api/control/AOI').then(response => {
        if(response.status === 200) {
          console.log("response:")
          console.log(response.data);
          $scope.AOI = Number(response.data) + 1;
          console.log($scope.AOI);
        }
      });
    }, 200);
    $scope.$on("$destroy", function() {
      if (AOIInterval) {
        $interval.cancel(AOIInterval);
      }
    });
    


  }
}

export default angular.module('robotfirefighterApp.etcalib', [uiRouter])
  .config(routes)
  .component('etcalib', {
    template: require('./etcalib.html'),
    controller: EtcalibComponent,
    controllerAs: 'etcalibCtrl'
  })
  .name;
