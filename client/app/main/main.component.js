import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';


//"use strict";

export class MainController {
  $http;
  socket;
  awesomeThings = [];
  newThing = '';

  /*@ngInject*/
  constructor($http, $scope, socket, hotkeys, $timeout, $interval) {

/*    $('iframe').contents().find('img').css({with: '100%', 'height': '100%'});*/

    $scope.nbfighted = 0;
    this.$http = $http;
    this.socket = socket;
    var debug = true;

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
        }
      }
    });

    // get zones locations from json file
    var zoneslocations;
    $scope.zones = [];
    $http.get('/api/control/zones').then(response => {
      if(response.status === 200) {
        zoneslocations = JSON.parse(response.data);
        $scope.zones = zoneslocations;
        for(var i = 0; i < zoneslocations.length; i++) {
          var xValz = $scope.realToCssPoseX(parseFloat(zoneslocations[i].x));
          var yValz = $scope.realToCssPoseY(parseFloat(zoneslocations[i].y));
          $scope.zones[i].x = xValz;
          $scope.zones[i].y = yValz;
        }
      }
    });


    // update every 300ms:
    // - fire states
    // - number of fighted fires
    // - water level
    // - remaining time
    // - TODO temperature
    // - TODO water management (remaining features)
    $scope.firstPump = 2;
    $scope.nbonfire = 0;
    var coeffXrob = 10;
    var constXrob = 50;
    $interval(function() {
      $http.get('/api/control/fires').then(response => {
        if(response.status === 200) {
          var sum = 0;
          for(var i = 0; i < response.data.length; i++) {
            if(response.data[i]) {
              $scope.opacityfire[i] = 1;
              sum++;
            } else {
              $scope.opacityfire[i] = 0;
            }
          }
          $scope.nbonfire = sum;
        }
      });
      $http.get('/api/control/fightedfires').then(response => {
        if(response.status === 200) {
          $scope.nbfighted = response.data;
        }
      });
      $http.get('/api/control/robotwater').then(response => {
        if(response.status === 200) {
          $scope.watlevel = response.data[0];
          robotTankEmpty = response.data[1];
        }
      });
      $http.get('/api/control/battery').then(response => {
        if(response.status === 200) {
          $scope.battlevel = response.data;
        }
      });
      $http.get('/api/control/time').then(response => {
        if(response.status === 200) {
          $scope.remainingtime = response.data;
        }
      });
      $http.get('/api/control/watermanagement').then(response => {
        if(response.status === 200) {
          $scope.xrobinet = response.data[0];
          vlvop = response.data[1];
          $scope.watlevelContainer = response.data[2]; 
          $scope.watlevelContainerMap = (94 - $scope.watlevelContainer)/5; 
          $scope.xrobinetwater = $scope.xrobinet + decal;
          var fxa = ($scope.xrobinet - 40) * 10 / 40;
          $scope.faucetxaxis = fxa.toPrecision(3);
          var temp = (vlvop - 5) * 10 / 5;
          $scope.valveopening = temp.toPrecision(3);
          $scope.widthwaterflow = 10 - Math.abs(temp);
          $scope.rotcross = temp.toPrecision(3)*30;
          $scope.yrobinet = coeffXrob * Math.cos($scope.faucetxaxis*3.1415*2 / 20) + constXrob;
        }
      });
      $http.get('/api/control/temperature').then(response => {
        if(response.status === 200) {
          $scope.mercurelevel = response.data[0];
          $scope.hotscreen = response.data[1];
        }
      });
      console.log($scope.firstPump)
      
      tictac = !tictac;
      if(tictac){
        $scope.widthTrashTapWater = 5;
      } else {
	$scope.widthTrashTapWater = 10;
      }
      if($scope.iconBatt<4){
        $scope.iconBatt++;
      } else {
        $scope.iconBatt = 0;
      }
    }, 500);
    var tictac = true; 
    $scope.iconBatt = 0; 



    // pump flow management
    $interval(function() {
    
      var inouts = [];
      var allFalse = true;
      for(var i = 0; i < $scope.inoutpipes.length; i++) {
        var myBool = Math.random()>0.5;
        inouts.push(myBool);
        allFalse = allFalse && !myBool; 
      }
      if (allFalse){
        inouts[0] = true;
      }

      $scope.inoutpipes = inouts;
    }, 10000);
    $scope.pumpSelected = 0;
    $scope.pumps = [9,27,45,63];/*,80];*/
    $scope.pumpsFlows = [5,0,0,0];/*,0];*/
    $scope.bendedpipes = [15,29,43,57]/*,71];*/

    $scope.inoutpipes = [true,true,false,false];/*,true];*/

    $scope.clickPump = function(number) {
      if($scope.pumpSelected==number) {
        $scope.pumpSelected = 0;
      } else{
        $scope.pumpSelected = number;
      }
    }
  
    $scope.pumpPlus = function(number) {
      if($scope.pumpsFlows[number]<5) { 
        $scope.pumpsFlows[number]++;
      }
    }

    $scope.pumpMinus = function(number) {
      if($scope.pumpsFlows[number]>0) {
        $scope.pumpsFlows[number]--;
      }
      var sumFlows = 0;
      var partialSumFlows = 0;
      for(var i=0; i<$scope.pumpsFlows.length; i++) {
        sumFlows = sumFlows + $scope.pumpsFlows[i];
        if(i>0) {
          partialSumFlows = partialSumFlows + $scope.pumpsFlows[i];
        }
      }
      if(sumFlows<5) {
        $scope.pumpsFlows[0] = 5-partialSumFlows;
      }
    }

    $scope.tozero = function() {
      if($scope.pumpSelected!=0) {
        $scope.pumpsFlows[$scope.pumpSelected-1] = 0;
      }
      var sumFlows = 0;
      var partialSumFlows = 0;
      for(var i=0; i<$scope.pumpsFlows.length; i++) {
        sumFlows = sumFlows + $scope.pumpsFlows[i];
        if(i>0) {
          partialSumFlows = partialSumFlows + $scope.pumpsFlows[i];
        }
      }
      if(sumFlows<5) {
        $scope.pumpsFlows[0] = 5-partialSumFlows;
      }
    }

    $scope.toone = function() {
      if($scope.pumpSelected!=0) {
        $scope.pumpsFlows[$scope.pumpSelected-1] = 1;
      }
      var sumFlows = 0;
      var partialSumFlows = 0;
      for(var i=0; i<$scope.pumpsFlows.length; i++) {
        sumFlows = sumFlows + $scope.pumpsFlows[i];
        if(i>0) {
          partialSumFlows = partialSumFlows + $scope.pumpsFlows[i];
        }
      }
      if(sumFlows<5) {
        $scope.pumpsFlows[0] = 5-partialSumFlows;
      }
    }

    $scope.totwo = function() {
      if($scope.pumpSelected!=0) {
        $scope.pumpsFlows[$scope.pumpSelected-1] = 2;
      }
      var sumFlows = 0;
      var partialSumFlows = 0;
      for(var i=0; i<$scope.pumpsFlows.length; i++) {
        sumFlows = sumFlows + $scope.pumpsFlows[i];
        if(i>0) {
          partialSumFlows = partialSumFlows + $scope.pumpsFlows[i];
        }
      }
      if(sumFlows<5) {
        $scope.pumpsFlows[0] = 5-partialSumFlows;
      }
    }

    $scope.tothree = function() {
      if($scope.pumpSelected!=0) {
        $scope.pumpsFlows[$scope.pumpSelected-1] = 3;
      }
      var sumFlows = 0;
      var partialSumFlows = 0;
      for(var i=0; i<$scope.pumpsFlows.length; i++) {
        sumFlows = sumFlows + $scope.pumpsFlows[i];
        if(i>0) {
          partialSumFlows = partialSumFlows + $scope.pumpsFlows[i];
        }
      }
      if(sumFlows<5) {
        $scope.pumpsFlows[0] = 5-partialSumFlows;
      }
    }

    
    $scope.tofour = function() {
      if($scope.pumpSelected!=0) {
        $scope.pumpsFlows[$scope.pumpSelected-1] = 4;
      }
      var sumFlows = 0;
      var partialSumFlows = 0;
      for(var i=0; i<$scope.pumpsFlows.length; i++) {
        sumFlows = sumFlows + $scope.pumpsFlows[i];
        if(i>0) {
          partialSumFlows = partialSumFlows + $scope.pumpsFlows[i];
        }
      }
      if(sumFlows<5) {
        $scope.pumpsFlows[0] = 5-partialSumFlows;
      }
    }

    
    $scope.tofive = function() {
      if($scope.pumpSelected!=0) {
        $scope.pumpsFlows[$scope.pumpSelected-1] = 5;
      }
    }





    $scope.$watch('pumpsFlows', function() {
      /*var sumWeight = 0;
      var counter = 0;
      while(sumWeight<5) {
        $scope.widthTrashTapWater =  $scope.widthTrashTapWater + 10;
      }*/
    })


    // -------------------------------------------------------------------------
    // send control/water action -> get position/orientation
    // -> use them to update corresponding variables of the map
    // -------------------------------------------------------------------------
    var pending = false;
    $scope.totheleft = function() {
      if(debug) {
        console.log('totheleft');
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'left'}).then(response => {
          pending = false;
          if(response.status === 200) {
            $scope.propFromTop = $scope.realToCssPoseY(response.data.posY[0]);
            $scope.propFromLeft = $scope.realToCssPoseX(response.data.posX[0]);
            $scope.rotindeg = 180 - (response.data.orientation[0] + 3.14) * 360 / (2 * 3.14);
            if(debug) {
              console.log(response.data.posX[0]);
              console.log(response.data.posY[0]);
              console.log(response.data.orientation[0]);
            }
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.totheright = function() {
      if(debug) {
        console.log('totheright');
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'right'}).then(response => {
          pending = false;
          if(response.status === 200) {
            $scope.propFromTop = $scope.realToCssPoseY(response.data.posY[0]);
            $scope.propFromLeft = $scope.realToCssPoseX(response.data.posX[0]);
            $scope.rotindeg = 180 - (response.data.orientation[0] + 3.14) * 360 / (2 * 3.14);
            if(debug) {
              console.log(response.data.posX[0]);
              console.log(response.data.posY[0]);
              console.log(response.data.orientation[0]);
            }
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.backward = function() {
      if(debug) {
        console.log('backward');
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'back'}).then(response => {
		//response.data
          if(response.status === 200) {
            $scope.propFromTop = $scope.realToCssPoseY(response.data.posY[0]);
            $scope.propFromLeft = $scope.realToCssPoseX(response.data.posX[0]);
            $scope.rotindeg = 180 - (response.data.orientation[0] + 3.14) * 360 / (2 * 3.14);
            if(debug) {
              console.log(response.data.posX[0]);
              console.log(response.data.posY[0]);
              console.log(response.data.orientation[0]);
            }
            pending = false;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.forward = function() {
      if(debug) {
        console.log('forward');
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'front'}).then(response => {
          pending = false;
          if(response.status === 200) {
            $scope.propFromTop = $scope.realToCssPoseY(response.data.posY[0]);
            $scope.propFromLeft = $scope.realToCssPoseX(response.data.posX[0]);
            $scope.rotindeg = 180 - (response.data.orientation[0] + 3.14) * 360 / (2 * 3.14);
            if(debug) {
              console.log(response.data.posX[0]);
              console.log(response.data.posY[0]);
              console.log(response.data.orientation[0]);
            }
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    var robotTankEmpty;
    $scope.water = function() {
      if(debug) {
        console.log('WATER');
      }
      if(!robotTankEmpty) {
        $scope.waterize = true;
        if(!pending) {
          pending = true;
          $http.post('/api/control', {key: 'space'}).then(response => {
            pending = false;
            if(response.status === 200) {
              $scope.propFromTop = $scope.realToCssPoseY(response.data.posY[0]);
              $scope.propFromLeft = $scope.realToCssPoseX(response.data.posX[0]);
              if(debug) {
                console.log(response.data.posX[0]);
                console.log(response.data.posY[0]);
              }
            } else if(debug) {
              console.log('nok');
            }
          });
        }
        $timeout(function() {
          $scope.waterize = false;
        }, 100);
      }
    };


    // water management
    $scope.xrobinet = 42;
    var decal = 4;
    var vlvop = 1;
    $scope.watlevelContainer = 10;

    var pendingButtons = false;
    $scope.faucetcontrol = 0;
    $scope.faucetctrlfctplus = function() {
      if($scope.faucetcontrol < 3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'plusT'}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              $scope.faucetcontrol = response.data.tapControl;
              if($scope.faucetcontrol>0) {
                $scope.faucetcontrol = '+' + $scope.faucetcontrol;
              }
            } else if(debug) {
              console.log('nok');
            }
          });
        }
      }
    };
    $scope.faucetctrlfctminus = function() {
      if($scope.faucetcontrol > -3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'minusT'}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              $scope.faucetcontrol = response.data.tapControl;
            } else if(debug) {
              console.log('nok');
            }
          });
        }
      }
    };
    $scope.openingcontrol = 0;
    $scope.openingctrlfctplus = function() {
      if($scope.openingcontrol < 3) {
         if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'plusV'}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              $scope.openingcontrol = response.data.valveControl;
            } else if(debug) {
              console.log('nok');
            }
          });
        }
      }
    };
    $scope.openingctrlfctminus = function() {
      if($scope.openingcontrol > -3) {
         if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'minusV'}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              $scope.openingcontrol = response.data.valveControl;
            } else if(debug) {
              console.log('nok');
            }
          });
        }
      }
    };

    $scope.robcurve = [];
    $scope.robaxis = [];
    $scope.robticknumber = [];
    for(var i = 0; i < 80; i=i+0.2) {
      $scope.robcurve.push({x: i, y: coeffXrob * Math.cos( (i - 40 )*3.1415*2 / 80) + constXrob + 25});
    }
    for(var i = 0; i < 85; i=i+0.2) {
      $scope.robaxis.push(i); 
    }
    for (var i = 0; i < 81; i = i + 8) {
      var valeur = (i - 40)*10 / 40;
      $scope.robticknumber.push({x: i, val: valeur});
    }
    hotkeys.add('left', 'totheleft', $scope.totheleft);
    hotkeys.add('right', 'totheright', $scope.totheright);
    hotkeys.add('down', 'backward', $scope.backward);
    hotkeys.add('up', 'forward', $scope.forward);
    hotkeys.add('space', 'water', $scope.water);
    hotkeys.add('0', 'tozero', $scope.tozero);
    hotkeys.add('1', 'toone', $scope.toone);
    hotkeys.add('2', 'totwo', $scope.totwo);
    hotkeys.add('3', 'tothree', $scope.tothree);
    hotkeys.add('4', 'tofour', $scope.tofour);
    hotkeys.add('5', 'tofive', $scope.tofive);
  }


  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        this.socket.syncUpdates('thing', this.awesomeThings);
      });
  }

  addThing() {
    if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }
  }

  deleteThing(thing) {
    this.$http.delete(`/api/things/${thing._id}`);
  }

}

export default angular.module('videogameApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
