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
  constructor($http, $scope, socket, hotkeys, $timeout, $interval, sharedProperties, $rootScope, $window) {
    $scope.language = $rootScope.language;
    /*$scope.user = {};
    $scope.user.pseudo = "";*/
    //---------------------
    // for online version:
    // -using nginx
    //$scope.address = "http://dev.humanrobotinteraction.fr/test";
    // -without nginx (networks blocking ports cannot see the video)
    //$scope.address = "http://dev.humanrobotinteraction.fr:8081/?action=stream";
    //---------------------
    // for local version
    //$scope.address = "http://localhost:8081/?action=stream";
    //---------------------
    // for PC SMI settings
    $scope.address = "http://192.168.1.2:8081/?action=stream";

    // refresh every 2secs
    var tictac = 0;
    $scope.addressUpdated = $scope.address
    var streamingInterval = $interval(function() {
      tictac = tictac + 1;
      tictac = tictac%2;
      $scope.addressUpdated = $scope.address + '?' + tictac;
      /*console.log($scope.addressUpdated);*/
    }, 2000);
    $scope.$on("$destroy", function() {
      if (streamingInterval) {
        $interval.cancel(streamingInterval);
      }
    });


    // GAME OVER OVERLAYS
    $scope.cause=0;
    $scope.overlayOpen = false;

    // ALARMS OVERLAYS
    $scope.alarmOverlayOpen = false;
    $scope.alarmCause = 0;
    $scope.alarmText = ["low battery", "too-high temperature", "60 seconds before the end of the mission", "robot's tank will soon be empty (2 shoots left)", "robot is in autonomous mode", "robot is in manual mode","ground tank is leaking", "ground tank's water level is low"];
    $scope.removeAlarm = function(){
      $scope.alarmOverlayOpen = false;
      $http.get('/api/control/removealarm').then(response => {
        if(response.status === 200) {
          $scope.alarmOverlayOpen = false;
        }
      });
    }
/*
- un feu vient de se déclarer
- n feux en cours
- battery faible
- température trop importante
- fin de la session dans ...
- rupture gps
- réservoir robot faible (3,2,1 tir possible)
- fuite de la réserve courante
- mode manuel
- mode automatique
*/
    $scope.finalnumfires = 0;
    $scope.nbfighted = 0;
    this.$http = $http;
    this.socket = socket;
    var debug = false;

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


    $scope.start = function(){
      $http.get('/api/control/start').then(response => {
        if(debug){
          console.log(response);
        }
        if(response.status === 200){

        }
        else{

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
    var mainInterval = $interval(function() {
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
          $scope.autonomous = response.data[4];
        }
      });

      $http.get('/api/control/finished').then(response => {
        if(response.status === 200) {
          $scope.overlayOpen = response.data[0];
          $scope.cause = response.data[1];
          $scope.finalnumfires = response.data[2];
          $scope.newBestScore = response.data[3];
          $scope.winnerPseudo = response.data[4];
        }
      });

      $http.get('/api/control/alarms').then(response => {
        if(response.status === 200) {
          $scope.alarmOverlayOpen = response.data[0];
          $scope.alarmCause = response.data[1];
        }
      });
    }, 500);
    $scope.$on("$destroy", function() {
        if (mainInterval) {
            $interval.cancel(mainInterval);
        }
    });



    // TODO $scope.leakPlaces ne défini que les endroits 3x3 ou il faut cliquer, randomiser la position de la fuite dans cet endroit avec $scope.leaksAbsPos
    $scope.leaksReverse = [];
    $scope.leftValues = [0,0,0,0,0,0,0,0,0];
    var previousNoleakat = [true,true,true,true,true,true,true,true,true]; 
    //var triche = [false,false,false,false,false,false,false,false,false];
    var leaksInterval = $interval(function() {
      $http.get('/api/control/leaks').then(response => {
        if(response.status === 200) {
          /* res.json([leakPlaces,noleakat,brokenContainer,crossSize]); */
          $scope.leakPlaces = response.data[0];
          $scope.noleakat = response.data[1];
          for (var i=0;i<$scope.leakPlaces.length; i++){
            if (!$scope.noleakat[i] && previousNoleakat[i]){
              if (Math.random()>0.5){
                $scope.leaksReverse[i] = -1;
              } else{
                $scope.leaksReverse[i] = 1;
              }
              $scope.leftValues[i] = Math.random()*30;
            }
          }
          previousNoleakat = $scope.noleakat;
          
/*          $scope.brokenContainer = response.data[2];
          $scope.crossSize = response.data[3];*/
        }
      });
     }, 500);
     $scope.$on("$destroy", function() {
        if (leaksInterval) {
            $interval.cancel(leaksInterval);
        }
     });

    
    $scope.iconBatt = 0; 

  


    // TODO ISPLAYING (with token) sent to control and auth every 10sec
    //var isPlaying = false;
    //var isPlaying = true;
/*
    var isPlayingInterval = $interval(function() {
      if(debug){
        console.log("IS PLAYING: ");
        console.log(isPlaying);
      }
      $http.post('/api/auth/isplaying', {isplaying: isPlaying, token: myToken}).then(response => {
        if(debug){
          console.log("wait for response....");
        }
        if(response.status === 200) {
          if(debug){
            console.log('isPlaying taken into account by auth');
          }
          //isPlaying = false;
        } else{
          if(debug){
            console.log('isPlaying -- nok auth');
          }
        }
      });
      //isPlaying = false;
    }, 10000);

     $scope.$on("$destroy", function() {
       if (isPlayingInterval) {
         $interval.cancel(isPlayingInterval);
       }
     });
*/

    $scope.gohome = function(){ 
/*    if($scope.newBestScore){
        $http.post('/api/control/pseudo', {pseudo: $scope.user.pseudo, token: myToken}).then(response => { // sans token, pas secure!
          if(response.status === 200) {
            if(debug){
              console.log($scope.user.pseudo);
              console.log("new pseudo sent");
            }
          } else{
            if(debug){
              console.log('nok pseudo');
            }
          }
        });
      }*/
      $timeout(function() {
        $window.location.reload();
      }, 100);
    }


/* TODO not used anymore + res.json needed:
    $scope.sendpseudo = function(){ 
    if($scope.newBestScore){
        $http.post('/api/control/pseudo', {pseudo: $scope.user.pseudo, token: myToken}).then(response => { // sans token, pas secure!
          if(response.status === 200) {
            if(debug){
              console.log($scope.user.pseudo);
              console.log("new pseudo sent");
            }
          } else{
            if(debug){
              console.log('nok pseudo');
            }
          }
        });
      }
      $timeout(function() {
        $window.location.reload();
      }, 100);
    }
*/

// + FAIRE UN BOUTON QUI SE CHARGE D'ENVOYER LE PSEUDO
// + global.newtoken()
    var pending = false;
    var myToken = $rootScope.token;
    $scope.killall = function(){
      myToken = $rootScope.token;
      if(!pending) {
        pending = true;
        $http.post('/api/control/killall', {token: myToken}).then(response => {
          pending = false;
          if(debug){
            console.log($rootScope.token);
          }
          if(response.status === 200) {
            $http.post('/api/auth/newtoken', {token: myToken}).then(response => { // TODO maybe after $http.post('/api/control/killall' ?
              if(response.status === 200) {
                $window.location.reload();
              } else if(debug) {
                console.log('nok auth');
              }
            });
          } else if(debug) {
            console.log('nok control');
          }
        });
      }
    }



    // -------------------------------------------------------------------------
    // send control/water action -> get position/orientation
    // -> use them to update corresponding variables of the map
    // -------------------------------------------------------------------------
    var pressedKeys = [];
    window.onkeyup = function(e) {pressedKeys[e.keyCode]=false;
            if (e.keyCode!=37 && e.keyCode!=38 && e.keyCode!=39 && e.keyCode!=40 && e.keyCode!=32 && e.keyCode!=68 && e.keyCode!=69 && e.keyCode!=83 && e.keyCode!=65){
        myToken = $rootScope.token;
        if(debug) {
          console.log('anyotherkey');
          console.log("pending:");
          console.log(pending);
        }
        if(!pending) {
          pending = true;
          $http.post('/api/control/otherkey', {key: 'otherkeyUp',token: myToken}).then(response => {
            pending = false;
            if(response.status === 200) {
              console.log('other sent');
            } else if(debug) {
              console.log('nok');
            }

          });
        }

      }
    }
    window.onkeydown = function(e) {pressedKeys[e.keyCode]=true;
            if (e.keyCode!=37 && e.keyCode!=38 && e.keyCode!=39 && e.keyCode!=40 && e.keyCode!=32 && e.keyCode!=68 && e.keyCode!=69 && e.keyCode!=83 && e.keyCode!=65){
        myToken = $rootScope.token;
        if(debug) {
          console.log('anyotherkey');
          console.log("pending:");
          console.log(pending);
        }
        if(!pending) {
          pending = true;
          $http.post('/api/control/otherkey', {key: 'otherkeyDown',token: myToken}).then(response => {
            pending = false;
            if(response.status === 200) {
              console.log('other sent');
            } else if(debug) {
              console.log('nok');
            }

          });
        }

      }
    }
/*
left arrow 	37
up arrow 	38
right arrow 	39
down arrow 	40 
(space) 	32 
*/

// TODO server part
// TODO also when it is pressed (till up) !!!!!! + ENREGISTRER CA AVEC 'OTHERCLICK' DANS UNE NOUVELLE COLONNE
// TODO last column to say when it is a real click or a keyboard shortcut

    

    $scope.otherclick = function(){
      console.log("click!");
      myToken = $rootScope.token;
        if(debug) {
          console.log('otherclick');
          console.log("pending:");
          console.log(pending);
        }
        if(!pending) {
          pending = true;
          $http.post('/api/control/otherkey', {key: 'otherClick',token: myToken}).then(response => {
            pending = false;
            if(response.status === 200) {
              console.log('other sent');
            } else if(debug) {
              console.log('nok');
            }

          });
        }
    };



    var keysInterval = $interval(function() {
      if(pressedKeys[38] && !pressedKeys[37] && !pressedKeys[39]) {
              $scope.forward();
      }
      if(pressedKeys[40] && !pressedKeys[37] && !pressedKeys[39]) {
              $scope.backward();
      }
      if(pressedKeys[37] && !pressedKeys[38] && !pressedKeys[40]) {
              $scope.totheleft();
      }
      if(pressedKeys[39] && !pressedKeys[38] && !pressedKeys[40]) {
              $scope.totheright();
      }

/*
      anotherKeyPressed = false;
      for(var i =0;i<pressedKeys.length;i++){
        if (i!=37 && i!=38 && i!=39 && i!=40 && i!=32 && i!=68 && i!=69 && i!=83 && i!=65){
          anotherKeyPressed = anotherKeyPressed || pressedKeys[i];
        }
      }
      if(anotherKeyPressed){
        console.log("anotherKeyPressed!!");
      }
*/
    }, 300);

    $scope.$on("$destroy", function() {
       if (keysInterval) {
         $interval.cancel(keysInterval);
       }
     });


    // __    
    // | |       
    // | |
    // | |____  
    // |______| 

    $scope.totheleft = function() {
      myToken = $rootScope.token;
      if(debug) {
        console.log('totheleft');
        console.log("pending:");
        console.log(pending);
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'left',token: myToken}).then(response => {
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
/*            if (pressedKeys[38] && !pressedKeys[37]) {
              $scope.forward();
              console.log("CONTINUE TOUT DROIT!");
            }*/
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };


    // _______    
    // | ___  |  
    // | __  _|
    // | | | |
    // |_|  |_| 
    $scope.totheright = function() {
      myToken = $rootScope.token;
      if(debug) {
        console.log('totheright');
        console.log("pending:");
        console.log(pending);
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'right',token: myToken}).then(response => {
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
/*            if (pressedKeys[38] && !pressedKeys[39]) {
              $scope.forward();
              console.log("CONTINUE TOUT DROIT!");
            }*/
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };


    //  ______    
    // | ___  |  
    // |  ____|   
    // | ___  |  
    // |______|
    $scope.backward = function() {
      myToken = $rootScope.token;
      if(debug) {
        console.log('backward');
        console.log("pending:");
        console.log(pending);
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'back',token: myToken}).then(response => {
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
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };


    // _______    
    // | _____|  
    // | ___|   
    // | |  
    // |_|
    $scope.forward = function() {
      myToken = $rootScope.token;
      if(debug) {
        console.log('forward');
        console.log("pending:");
        console.log(pending);
      }
      if(!pending) {
        pending = true;
        $http.post('/api/control', {key: 'front', token: myToken}).then(response => {
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
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    var robotTankEmpty;
    $scope.water = function() {
      myToken = $rootScope.token;
      if(debug) {
        console.log('WATER');
        console.log("pending:");
        console.log(pending);
      }
      if(!robotTankEmpty) {
 //       $scope.waterize = true;
        if(!pending) {
          pending = true;
          $http.post('/api/control', {key: 'space', token: myToken}).then(response => {
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
              //isPlaying = true;
            } else if(debug) {
              console.log('nok');
            }
          });
        }
        /*$timeout(function() {
          $scope.waterize = false;
        }, 100);*/
      }
    };


    // water management
    $scope.xrobinet = 42;
    var decal = 4;
    var vlvop = 1;
    $scope.watlevelContainer = 50;

    var pendingButtons = false;
    $scope.faucetcontrol = 0;

    // tap direction through wheel
    $scope.faucetctrlfctplus = function() {
      myToken = $rootScope.token;
      if($scope.faucetcontrol < 3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'plusT',token: myToken}).then(response => {
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
              //isPlaying = true;
            } else if(debug) {
              console.log('nok');
            }
          });
        }
      }
    };

    $scope.faucetctrlfctminus = function() {
      myToken = $rootScope.token;
      if($scope.faucetcontrol > -3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'minusT',token: myToken}).then(response => {
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
              //isPlaying = true;
              $scope.animtime = 10 - Math.abs($scope.faucetcontrol)*3;
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


//  send click on pushwater to server
    $scope.waterwidth = 0;
    $scope.waterPushButton = function() {
      myToken = $rootScope.token;
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'pushButton',token: myToken}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            if(debug){
              console.log("pushbutton well received");
            }
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

    $scope.wrenchOnOff = function() {
      myToken = $rootScope.token;
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'wrenchButton',token: myToken}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            $scope.wrenchMode = response.data.wrenchMode;
            if(debug){
              console.log("wrench mode ON/OFF! MODE: " + $scope.wrenchMode );
            }
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };

// using keys
    $scope.faucetctrlfctplusKey = function() {
      myToken = $rootScope.token;
      if($scope.faucetcontrol < 3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'plusT',token: myToken}).then(response => {
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
              //isPlaying = true;
            } else if(debug) {
              console.log('nok');
            }

            $http.post('/api/control/keyboard', {token: myToken}).then(response => {
              pendingButtons = false;
              if(response.status === 200) {
                console.log("keyboard");
              }
            });

          });
        }
      }
    };

    $scope.faucetctrlfctminusKey = function() {
      myToken = $rootScope.token;
      if($scope.faucetcontrol > -3) {
        if(!pendingButtons) {
          pendingButtons = true;
          $http.post('/api/control/watercontrol', {button: 'minusT',token: myToken}).then(response => {
            if(response.status === 200) {
              $scope.faucetcontrol = response.data.tapControl;
              if(response.data.tapControl>0){
                $scope.direction = 1;
              } else if(response.data.tapControl<0) {
                $scope.direction = -1;
              } else {
                $scope.direction = 0;
              }
              //isPlaying = true;
              $scope.animtime = 10 - Math.abs($scope.faucetcontrol)*3;
              if($scope.faucetcontrol>0) {
                $scope.faucetcontrol = '+' + $scope.faucetcontrol;
              }
            } else if(debug) {
              console.log('nok');
            }

            $http.post('/api/control/keyboard', {token: myToken}).then(response => {
              pendingButtons = false;
              if(response.status === 200) {
                console.log("keyboard");
              }
            });

          });
        }
      }
    };

    $scope.waterPushButtonKey = function() {
      myToken = $rootScope.token;
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'pushButton',token: myToken}).then(response => {
          if(response.status === 200) {
            if(debug){
              console.log("pushbutton well received");
            }
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }

          $http.post('/api/control/keyboard', {token: myToken}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              console.log("keyboard");
            }
          });

        });
      }
    };

    $scope.wrenchOnOffKey = function() {
      myToken = $rootScope.token;
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'wrenchButton',token: myToken}).then(response => {
          if(response.status === 200) {
            $scope.wrenchMode = response.data.wrenchMode;
            if(debug){
              console.log("wrench mode ON/OFF! MODE: " + $scope.wrenchMode );
            }
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }

          $http.post('/api/control/keyboard', {token: myToken}).then(response => {
            pendingButtons = false;
            if(response.status === 200) {
              console.log("keyboard");
            }
          });


        });
      }
    };







    $scope.clickLeak = function(leakId) {
      myToken = $rootScope.token;
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'clickLeak', leakid: leakId, token: myToken}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            $scope.noleakat = response.data.noLeakAt;
            $scope.wrenchMode = response.data.wrenchMode;
            if(debug){
              console.log("clikleak -- : " + $scope.noleakat );
            }
            //isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };
/*
    $scope.newContainer = function() {
      myToken = $rootScope.token;
      if(!pendingButtons) {
        pendingButtons = true;
        $http.post('/api/control/watercontrol', {button: 'newContainer', token: myToken}).then(response => {
          pendingButtons = false;
          if(response.status === 200) {
            $scope.noleakat = response.data.noLeakAt;
            $scope.brokenContainer = response.data.brokenContainer;
            $scope.crossSize = response.data.crossSize;
            isPlaying = true;
          } else if(debug) {
            console.log('nok');
          }
        });
      }
    };*/

    $scope.otherKey = function(){
      console.log('other')
    };

    hotkeys.add('left', 'totheleft', $scope.totheleft);
    hotkeys.add('right', 'totheright', $scope.totheright);
    hotkeys.add('down', 'backward', $scope.backward);
    hotkeys.add('up', 'forward', $scope.forward);
    hotkeys.add('space', 'water', $scope.water);

//  WATER: SD A E
    hotkeys.add('s', 'tapleft', $scope.faucetctrlfctminusKey);
    hotkeys.add('d', 'tapright', $scope.faucetctrlfctplusKey);
    hotkeys.add('e', 'pushbutton', $scope.waterPushButtonKey);
    hotkeys.add('a', 'wrench', $scope.wrenchOnOffKey);



// others
/*
    hotkeys.add('z', 'otherKey', $scope.otherKey);
    hotkeys.add('r', 'otherKey', $scope.otherKey);
    hotkeys.add('t', 'otherKey', $scope.otherKey);
    hotkeys.add('y', 'otherKey', $scope.otherKey);
    hotkeys.add('u', 'otherKey', $scope.otherKey);
    hotkeys.add('i', 'otherKey', $scope.otherKey);
    hotkeys.add('o', 'otherKey', $scope.otherKey);
    hotkeys.add('p', 'otherKey', $scope.otherKey);
    hotkeys.add('q', 'otherKey', $scope.otherKey);
    hotkeys.add('f', 'otherKey', $scope.otherKey);
    hotkeys.add('g', 'otherKey', $scope.otherKey);
    hotkeys.add('h', 'otherKey', $scope.otherKey);
    hotkeys.add('j', 'otherKey', $scope.otherKey);
    hotkeys.add('k', 'otherKey', $scope.otherKey);
    hotkeys.add('l', 'otherKey', $scope.otherKey);
    hotkeys.add('m', 'otherKey', $scope.otherKey);
    hotkeys.add('w', 'otherKey', $scope.otherKey);
    hotkeys.add('x', 'otherKey', $scope.otherKey);
    hotkeys.add('c', 'otherKey', $scope.otherKey);
    hotkeys.add('v', 'otherKey', $scope.otherKey);
    hotkeys.add('b', 'otherKey', $scope.otherKey);
    hotkeys.add('n', 'otherKey', $scope.otherKey);
    hotkeys.add('ctrl', 'otherKey', $scope.otherKey);
    hotkeys.add('tab', 'otherKey', $scope.otherKey);
    hotkeys.add('shift', 'otherKey', $scope.otherKey);
    hotkeys.add('command', 'otherKey', $scope.otherKey);
*/
/*
command   : '\u2318',     // ⌘
          shift     : '\u21E7',     // ⇧
          left      : '\u2190',     // ←
          right     : '\u2192',     // →
          up        : '\u2191',     // ↑
          down      : '\u2193',     // ↓
          'return'  : '\u23CE',     // ⏎
backspace

    hotkeys.add('fn', 'otherKey', $scope.otherKey);
    hotkeys.add('alt', 'otherKey', $scope.otherKey);
*/

/*
    hotkeys.add('0', 'tozero', $scope.tozero);
    hotkeys.add('1', 'toone', $scope.toone);
    hotkeys.add('2', 'totwo', $scope.totwo);
    hotkeys.add('3', 'tothree', $scope.tothree);
    hotkeys.add('4', 'tofour', $scope.tofour);
    hotkeys.add('5', 'tofive', $scope.tofive);
*/
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
