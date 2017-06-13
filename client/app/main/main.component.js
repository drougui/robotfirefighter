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
    
    // token or notoken
    var token = "";
    $http.get('/api/auth').then(response => {
      console.log(response);
      $scope.emptySlot=response.data;
    })
    $scope.play = function(){
      $http.get('/api/auth/play').then(response => {
        console.log(response);
        if(response.status === 200){
          token=response.data;			
        }
        else{
          $scope.emptySlot=false;
        }
      })
    }


    $scope.killall = function(){
      $http.get('/api/auth/killall').then(response => {
        console.log(response);
        if(response.status === 200){
          //token=response.data;			
        }
        else{
          //$scope.emptySlot=false;
        }
      })
    }

    $scope.start = function(){
      $http.get('/api/auth/start').then(response => {
        console.log(response);
        if(response.status === 200){
          //token=response.data;			
        }
        else{
          //$scope.emptySlot=false;
        }
      })
    }


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


    // update every 500ms:
    // - fire states
    // - number of fighted fires
    // - water level
    // - remaining time
    // - temperature
    // - water management
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
          var waterwidth = response.data[1];
          $scope.watlevelContainer = response.data[2]; 
          $scope.watlevelContainerMap = (94 - $scope.watlevelContainer)/5; 
          $scope.xrobinetwater = $scope.xrobinet + decal;
          var fxa = ($scope.xrobinet - 40) * 10 / 40;
          $scope.faucetxaxis = fxa.toPrecision(3);
          $scope.yrobinet = coeffXrob * Math.cos($scope.faucetxaxis*3.1415*2 / 20) + constXrob;
          $scope.waterwidth = waterwidth/10;
        }
      });
      $http.get('/api/control/temperature').then(response => {
        if(response.status === 200) {
          $scope.mercurelevel = response.data[0];
          $scope.hotscreen = response.data[1];
        }
      });

      $http.get('/api/control/robot').then(response => {
        if(response.status === 200) {
          $scope.propFromLeft = $scope.realToCssPoseX(response.data[0]);
          $scope.propFromTop = $scope.realToCssPoseY(response.data[1]);
          $scope.rotindeg = 180 - (response.data[2]+  3.14) * 360 / (2 * 3.14);
          $scope.waterize = response.data[3];
/*          $timeout(function() {

            $scope.waterize = false;
          }, 100);*/
 //robotx,roboty,roboto,currentsplatch
        }
      });
    
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


    $interval(function() {
      $http.get('/api/control/leaks').then(response => {
        if(response.status === 200) {
          /* res.json([leakPlaces,noleakat,brokenContainer,crossSize]); */
          $scope.leakPlaces = response.data[0];
          $scope.noleakat = response.data[1];
          $scope.brokenContainer = response.data[2];
          $scope.crossSize = response.data[3];
        }
      });
     }, 500);

    var tictac = true; 
    $scope.iconBatt = 0; 

  
    // -------------------------------------------------------------------------
    // send control/water action -> get position/orientation
    // -> use them to update corresponding variables of the map
    // -------------------------------------------------------------------------
    var pressedKeys = [];
    window.onkeyup = function(e) {pressedKeys[e.keyCode]=false;}
    window.onkeydown = function(e) {pressedKeys[e.keyCode]=true;}


    var pending = false;
    $scope.totheleft = function() {
      if(debug) {
        console.log('totheleft');
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'left',token: token}).then(response => {
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
		if (pressedKeys[38] && !pressedKeys[37]) {
    			$scope.forward();
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
        $http.post('/api/control', {key: 'right',token: token}).then(response => {
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
		if (pressedKeys[38] && !pressedKeys[39]) {
    			$scope.forward();
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
        $http.post('/api/control', {key: 'back',token: token}).then(response => {
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
        $http.post('/api/control', {key: 'front',token: token}).then(response => {
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
 //       $scope.waterize = true;
        if(!pending) {
          pending = true;
          $http.post('/api/control', {key: 'space',token: token}).then(response => {
            pending = false;
            if(response.status === 200) {
              $scope.propFromTop = $scope.realToCssPoseY(response.data.posY[0]);
              $scope.propFromLeft = $scope.realToCssPoseX(response.data.posX[0]);
              $scope.watlevel = response.data.waterlevel;
              $scope.waterize = response.data.splatch;
              console.log(response.data.waterlevel);
              if(debug) {
                //console.log('watlevel: ' + response.data.waterlevel);
              }
            } else if(debug) {
              console.log('nok');
            }
          });
        }
/*        $timeout(function() {
          $scope.waterize = false;
        }, 100);*/
      }
    };


    // water management
    $scope.xrobinet = 42;
    var decal = 4;
    var vlvop = 1;
    $scope.watlevelContainer = 10;

    var pendingButtons = false;
    $scope.faucetcontrol = 0;

    // tap direction through wheel
    $scope.faucetctrlfctplus = function() {
      if($scope.faucetcontrol < 3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'plusT',token: token}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              $scope.faucetcontrol = response.data.tapControl;
              if(response.data.tapControl>0){
                $scope.direction = 1;
              } else if(response.data.tapControl<0) {
                $scope.direction = -1;
              } else {
                $scope.direction = 0;
              }
              $scope.animtime = 7 - Math.abs($scope.faucetcontrol)*2;
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
          $http.post('/api/control/watercontrol', {button: 'minusT',token: token}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              $scope.faucetcontrol = response.data.tapControl;
              if(response.data.tapControl>0){
                $scope.direction = 1;
              } else if(response.data.tapControl<0) {
                $scope.direction = -1;
              } else {
                $scope.direction = 0;
              }
              $scope.animtime = 10 - Math.abs($scope.faucetcontrol)*3;
            } else if(debug) {
              console.log('nok');
            }
          });
        }
      }
    };


//  send click on pushwater to server
    $scope.waterwidth = 0;
    $scope.waterPushButton = function() {
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'pushButton',token: token}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            console.log("pushbutton well received")
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.wrenchOnOff = function() {
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'wrenchButton',token: token}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            $scope.wrenchMode = response.data.wrenchMode;
            console.log("wrench mode ON/OFF! MODE: " + $scope.wrenchMode )
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.clickLeak = function(leakId) {
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'clickLeak', leakid: leakId, token: token}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            $scope.noleakat = response.data.noLeakAt;
            $scope.wrenchMode = response.data.wrenchMode;
            console.log("clikleak -- : " + $scope.noleakat )
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.newContainer = function() {
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'newContainer', token: token}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            $scope.noleakat = response.data.noLeakAt;
            $scope.brokenContainer = response.data.brokenContainer;
            $scope.crossSize = response.data.crossSize;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };


    hotkeys.add('left', 'totheleft', $scope.totheleft);
    hotkeys.add('right', 'totheright', $scope.totheright);
    hotkeys.add('down', 'backward', $scope.backward);
    hotkeys.add('up', 'forward', $scope.forward);
    hotkeys.add('space', 'water', $scope.water);
// s d a z e
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
  .component('game', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
