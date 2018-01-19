'use strict';
var express = require('express');
var router = express.Router();

var sys = require('sys');
var exec = require('child_process').exec;
//=====================================================
// LSL TCP client
//=====================================================
exec('python ~/driving-human-robots-interaction/miniServer.py');

var clientTCP;
var net;
setTimeout(function() {
  net = require('net');
  clientTCP = new net.Socket();
  clientTCP.connect(1337, '127.0.0.1', function() {
    console.log('Connected');
    //clientTCP.write('Hi LSL I am nodejs');
  });
}, 5000);

// TODO pour l'instant on lance le miniServer (i.e. LSL) avant de lancer le jeu
// mais il faudra le lancer avec "exec" ensuite
// et kill le client proprement
// le client doit etre lancé pour etre capté par Labrecorder


// ==================================
//   MARKERS
// ==================================
exec('python ~/driving-human-robots-interaction/EXPE_RF/miniServerMarkers.py');
var clientTCP2;
setTimeout(function() {
  net = require('net');
  clientTCP2 = new net.Socket();
  clientTCP2.connect(1338, '127.0.0.1', function() {
    console.log('Connected');
  });
}, 5000);

router.post('/markers', function(req, res) {
   clientTCP2.write(req.body.marker);
   res.json();
});


// ==================================
//   NASA-TLX
// ==================================
var fs = require('fs');
router.post('/nasatlx', function(req, res/*, next*/) {
      var nasadate = new Date();
      fs.writeFile("../nasa-tlx_" + nasadate.getFullYear() + '_' + ('0' + (nasadate.getMonth()+1)).slice(-2) + '_' + ('0' + nasadate.getDate()).slice(-2) + '__' + ('0' + nasadate.getHours()).slice(-2) + '_' + ('0' + nasadate.getMinutes()).slice(-2) + '.html', req.body.nasatlx, function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }); 
      res.json();
});



//=====================================================
// define trees locations using treeslocs.json
//=====================================================

//var chaine = fs.readFileSync('/home/drougard/driving-human-robots-interaction/treeslocs.json', 'UTF-8');
var chaine = fs.readFileSync('../driving-human-robots-interaction/treeslocs.json', 'UTF-8');
var treeslocations = JSON.parse(chaine);
console.log('TREES LOCATIONS');
console.log(treeslocations[0].x);
router.get('/', function(req, res) {
  res.json(chaine);
});

//=====================================================
// define zones locations using zones.json
//=====================================================
//var chaine2 = fs.readFileSync('/home/drougard/driving-human-robots-interaction/zones.json', 'UTF-8');
var chaine2 = fs.readFileSync('../driving-human-robots-interaction/zones.json', 'UTF-8');
var zoneslocations = JSON.parse(chaine2);
console.log('ZONES LOCATIONS');
console.log(zoneslocations[0].x);
router.get('/zones', function(req, res) {
  res.json(chaine2);
});

//=====================================================
// define scores using scores.json
//=====================================================
var chaine3 = fs.readFileSync('../driving-human-robots-interaction/scores.json', 'UTF-8');
var scores = JSON.parse(chaine3);
console.log('SCORES');
console.log(scores);
router.get('/scores', function(req, res) {
  chaine3 = fs.readFileSync('../driving-human-robots-interaction/scores.json', 'UTF-8');
  res.json(chaine3);
});


// declare intervals
var waterManagementInterval;
var leaksInterval;
var waterFlowInterval;
var timeInterval;
var batteryInterval;
var treeBurningInterval;
var fillWaterInterval;
var fillBatteryInterval;

var autonomyInterval;
var automanualInterval;
var timeoutOnManualAlarm;

var currentPseudo = '';

var autonomousRobot = 0;
var rewardsSum = 0;
var finalNumFightedFires = 0;
var finalNumFightedFiresSent = 0;

var newBestScore = false;
var rank = 0;

var writeAlarms = [];
var writeUsedKeys = [];
var writeClicks = [];
var writeOthers = [];
var keyboardShortcuts = [];
// declare variables
var xrobinet = 42;
var mercurelevelfloat = 10;
var mercurelevel = '0.1vw';
var hotscreen = 0;
var firesStatesOfTrees = [];
for(var i=0; i<treeslocations.length;i++) {
  firesStatesOfTrees.push(false);
}
var watlevel = 50;
var robotTankEmpty = false;
var isFillingWater = false;

//var crossSize = 0;
var leakPlacesNb = 9;
var leakPlaces = [];
var noleakat = [];
var leakCounter = 0;
for (var i=0; i<leakPlacesNb; i++) {
  leakPlaces.push(leakCounter);
  leakCounter++;
  noleakat.push(true);
}
var vlvop = 1;
var watlevelContainer = 50;
var remainingtime = 600;
var batteryLevel = 100;
var numFightedFires = 0;


var overlayOpen = false;
var cause = 0;
var alarmOverlayOpen = false;
var alarmCause = 0;
var alarmSituations = [false,false,false,false,false,false];

var currentGoalX = 0.0;
var currentGoalY = 0.0;
var currentAvoidTree = false;
var currentAvoidTreeSession = false;
var currentGoalTreeI = -1;
var goalIsATree = false;
var batteryNeeded = false;
var batteryNeededSession = false;
var waterNeeded = false;
var waterNeededSession = false;

var currentAutonomyTime = 0;

router.post('/killall', killall); // kill morse, + init js
router.post('/start',start); // launch morse
router.post('/launchgame',launchgame); // launch js

function killall(req, res) {
  if(req.body.token) {
    writeClicks.push('giveUp');
    var decoded = jwt.decode(req.body.token, secret);
    console.log(decoded);
    if(decoded.auth && decoded.exp === global.expires){
      exec('bash ~/driving-human-robots-interaction/killAll.sh');

      // clear intervals 
      clearInterval(waterManagementInterval);
      clearInterval(leaksInterval);
      clearInterval(waterFlowInterval);
      clearInterval(timeInterval);
      clearInterval(batteryInterval);
      clearInterval(treeBurningInterval);
      clearInterval(fillWaterInterval);
      clearInterval(fillBatteryInterval);
      clearInterval(autonomyInterval);
      clearInterval(automanualInterval);

      if(typeof wstream !== 'undefined' && wstream){
        wstream.end();
      }
      clearTimeout(timeoutOnManualAlarm);
      overlayOpen = false;
      cause = 0;
      alarmOverlayOpen = false;
      alarmCause = 0;
      alarmSituations = [false,false,false,false,false,false];
      abortSession = false;
      firstTime = false;
      currentGoalX = 0.0;
      currentGoalY = 0.0;
      currentGoalTreeI = -1;
      currentAvoidTree = false;
      currentAvoidTreeSession = false;
      goalIsATree = false;
      batteryNeeded = false;
      batteryNeededSession = false;
      waterNeeded = false;
      waterNeededSession = false;

      currentAutonomyTime = 0;
      autonomousRobot = 0

      writeAlarms = [];
      writeUsedKeys = [];
      writeClicks = [];
      writeOthers = [];
      keyboardShortcuts = []

      xrobinet = 42;
      mercurelevelfloat = 10;
      mercurelevel = '0.1vw';
      hotscreen = 0;
      firesStatesOfTrees = [];
      for(var i=0; i<treeslocations.length;i++) {
        firesStatesOfTrees.push(false);
      }
      watlevel = 50;
      robotTankEmpty = false;
      isFillingWater = false;
//      currentPseudo = '';
      //crossSize = 0;
      leakPlacesNb = 9;
      leakPlaces = [];
      noleakat = [];
      leakCounter = 0;
      for (var i=0; i<leakPlacesNb; i++) {
        leakPlaces.push(leakCounter);
        leakCounter++;
        noleakat.push(true);
      }
      vlvop = 1;
      watlevelContainer = 50;
      remainingtime = "few";
      batteryLevel = 100;
      numFightedFires = 0;
      exec('bash ~/driving-human-robots-interaction/killAll.sh');
      res.status(200).json("everything killed")
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token");
  }
}

function start(req, res) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    console.log(decoded);
    if(decoded.auth && decoded.exp === global.expires){
      exec('bash ~/driving-human-robots-interaction/killall.sh');
      exec('bash ~/driving-human-robots-interaction/restart.sh');
      res.status(200).json("restart");
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
}




//=====================================================
// get position/orientation from orocos
//=====================================================

var PORT = 9000;
var PORTGET = 9010;
var HOST = 'localhost';
var dgram = require('dgram');
var serverGet = dgram.createSocket('udp4');
serverGet.on('listening', function() {
  var address = serverGet.address();
  console.log('UDP Server listening on ' + address.address + ':' + address.port);
});
var robotx = 0.0;
var roboty = 0.0;
var roboto = 0.0;
var pastRobotx = 0.0;
var pastRoboty = 0.0;
//var thecounter = 0;
var currentAutoMvt = false;

var abortSession = false;
// every second, called by rttlua
serverGet.on('message', function(message, remote) {
  console.log("MESSAGE FROM RTTLUA:");
  pastRobotx = robotx;
  pastRoboty = roboty;

  var byteArray = new Int8Array(4);
  for(var i = 0; i < 4; i++) {
    byteArray[i] = message[8 + 6 * 4 + i];
  }
  var posY = new Float32Array(byteArray.buffer);

  var byteArray2 = new Int8Array(4);
  for(var j = 0; j < 4; j++) {
    byteArray2[j] = message[8 + 7 * 4 + j];
  }
  var posX = new Float32Array(byteArray2.buffer);

  var byteArray3 = new Int8Array(4);
  for(var k = 0; k < 4; k++) {
    byteArray3[k] = message[8 + 8 * 4 + k];
  }
  var orientation = new Float32Array(byteArray3.buffer);
  
  var byteArray4 = new Int8Array(2);
  for(var l = 0; l < 2; l++) {
    byteArray4[l] = message[8 + 50 * 4 + IND_ENDGOTO*2 + l];
  }
  var noMvt = new Int16Array(byteArray4.buffer);

  if(false) {
    console.log(remote.address + ':' + remote.port + ' - ' + posX + '  ' + posY + '  ' + orientation + '  ' + noMvt);
  }
  robotx = posX;
  roboty = posY;
  roboto = orientation;

 // AVOID TREES
 if(autonomousRobot==1) {
    var concernedTree = -1;
    for(var q = 0; q < treeslocations.length; q++) {
      if( currentGoalTreeI != q && !currentAvoidTree){
        for(var LL = 0; LL<4; LL=LL+0.1){ // TODO A CALIBRER POUR QUIL NY AIT PLUS DE PBM
          for(var ll = -0.3; ll<0.3; ll=ll+0.1 ){
            if (!currentAvoidTree && Math.sqrt( Math.pow( parseFloat(robotx[0]) + LL*Math.cos(roboto) - ll*Math.sin(roboto)-parseFloat(treeslocations[q].x),2) + Math.pow(parseFloat(roboty[0]) + LL*Math.sin(roboto) + ll*Math.cos(roboto)-parseFloat(treeslocations[q].y) ,2) ) < 0.5 && Math.sqrt( Math.pow(parseFloat(pastRobotx[0])-parseFloat(robotx[0]),2) + Math.pow(parseFloat(pastRoboty[0])-parseFloat(roboty[0]),2) ) > 0.1 ){
              concernedTree = q;
              currentAvoidTree = true;
              console.log("FACE A TREE !!!!");              
              // ABORT + rot + forward + goto again
            }
          }
        }
      }
    }
    if (currentAvoidTree && !currentAvoidTreeSession){
      currentAvoidTreeSession = true;
      var udpMess = abortMoveToUdpMess();
      var buffer = new Buffer(udpMess);
      var client = dgram.createSocket('udp4');
      console.log("!!!!!!!!!!!! send abort to robot AVOID TREE !!!!!!!!!!!!");
      client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
        if(err) throw err;
        console.log('abort sent to ' + HOST +':'+ PORT);
        client.close();
      });

      var direction = 0.05;
      if(Math.cos(roboto) * (parseFloat(treeslocations[concernedTree].y) - parseFloat(roboty[0])) - Math.sin(roboto) * (parseFloat(treeslocations[concernedTree].x) - parseFloat(robotx[0]))>0){
        direction = -0.05;
      }


      setTimeout(function() {
        var udpMess1 = speedToUdpMess(0.0, -0.6);
        var buffer1 = new Buffer(udpMess1);
        var client1 = dgram.createSocket('udp4');
        client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
          if(err) throw err;
          //console.log('UDP message sent to ' + HOST +':'+ PORT);
          client1.close();
          console.log("= CLIENT 1 =");
        });
      }, 500);
       
      setTimeout(function() {
        var udpMess2 = speedToUdpMess(direction, 0.0);
        var buffer2 = new Buffer(udpMess2);
        var client2 = dgram.createSocket('udp4');
        client2.send(buffer2, 0, buffer2.length, PORT, HOST, function(err) {
          if(err) throw err;
          //console.log('UDP message sent to ' + HOST +':'+ PORT);
          client2.close();
          console.log("= CLIENT 2 =");
        });
      }, 1000);
      
      setTimeout(function() {
        var udpMess3 = speedToUdpMess(direction, 0.6);
        var buffer3 = new Buffer(udpMess3);
        var client3 = dgram.createSocket('udp4');
        client3.send(buffer3, 0, buffer3.length, PORT, HOST, function(err) {
          if(err) throw err;
          //console.log('UDP message sent to ' + HOST +':'+ PORT);
          client3.close();
          console.log("= CLIENT 3 =");
        });
        currentAvoidTreeSession=false
        currentAvoidTree=false;
        waterNeeded = false;
        waterNeededSession = false;
      }, 1500);

    }
  }

  // time to go > battery time + marge
  if(batteryLevel - 10 <= Math.sqrt( Math.pow(zoneslocations[1].x-robotx[0], 2) + Math.pow(zoneslocations[1].y-roboty[0], 2) )*0.6 && !batteryNeeded){
    batteryNeeded = true;
  }
  if(batteryNeeded && batteryLevel>=99){
    batteryNeeded = false;
    batteryNeededSession = false;
    waterNeeded = false;
    waterNeededSession = false;
  }

  // alarm battery
  if(batteryLevel - 10 <= Math.sqrt( Math.pow(zoneslocations[1].x-robotx[0], 2) + Math.pow(zoneslocations[1].y-roboty[0], 2) )*0.6 && !alarmSituations[0]){
    if(!alarmOverlayOpen && Math.random()>0.5){
      alarmOverlayOpen = true;
      alarmCause = 0;
      alarmSituations[0] = true;
      writeAlarms.push(alarmCause);
    }
  }
  if(batteryLevel >= 50){
    alarmSituations[0] = false;
  }


  if(watlevel==0 && !waterNeeded && !batteryNeeded){
    waterNeeded = true;
  }
  if(watlevel>50 && waterNeeded){
    waterNeeded = false;
    waterNeededSession = false;
  }

// AVOIDTREES
  console.log("~~~~~~~~~~~~AUTONOMY VARIABLES~~~~~~~~~~~~");
  console.log("firstTime:");
  console.log(firstTime);
  console.log("goalIsATree:");
  console.log(goalIsATree);
  console.log("abortSession:");
  console.log(abortSession);
  console.log("currentGoalX:");
  console.log(currentGoalX);
  console.log("currentGoalY:");
  console.log(currentGoalY);
  console.log("batteryNeeded:");
  console.log(batteryNeeded);
  console.log("batteryNeededSession");
  console.log(batteryNeededSession);
  console.log("waterNeeded:");
  console.log(waterNeeded);
  console.log("waterNeededSession:");
  console.log(waterNeededSession);
  console.log("batteryLevel:");
  console.log(batteryLevel);
  console.log("currentAutoMvt: ");
  console.log(currentAutoMvt);
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");

  if(autonomousRobot==1 && goalIsATree) {
      if( Math.sqrt( Math.pow(currentGoalX - (parseFloat(robotx)+2*Math.cos(roboto)) , 2) 
+ Math.pow(currentGoalY- (parseFloat(roboty)+2*Math.sin(roboto)), 2) ) < 1.0  || Math.sqrt( Math.pow(currentGoalX - (parseFloat(robotx)+ 0.5*Math.cos(roboto)) , 2) 
+ Math.pow(currentGoalY- (parseFloat(roboty)+0.5*Math.sin(roboto)), 2) ) < 1.0){
        if(!abortSession) {
          udpMess = abortMoveToUdpMess();
          buffer = new Buffer(udpMess);
          client = dgram.createSocket('udp4');
          console.log("!!!!!!!!!!!! send abort to robot CLOSE TO TREE !!!!!!!!!!!!");
          client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
            if(err) throw err;
            console.log('abort sent to ' + HOST +':'+ PORT);
            client.close();
          });
          abortSession = true; 
          throwWater();

          setTimeout(function() {
            var udpMess1 = speedToUdpMess(0.0, -0.5);
            var buffer1 = new Buffer(udpMess1);
            var client1 = dgram.createSocket('udp4');
            client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
              if(err) throw err;
              client1.close();
            });
          }, 1000);
          setTimeout(function() {
            var udpMess1 = speedToUdpMess(0.0, -0.5);
            var buffer1 = new Buffer(udpMess1);
            var client1 = dgram.createSocket('udp4');
            client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
              if(err) throw err;
              client1.close();
            });
          }, 1500);

        }
      }
  }

  // TODO se retirer du feu si temp trop grande: 
  // calculer tous les vecteurs robot->arbres pour lesquels le robot est dans la zone de l'arbre. en faire la moyenne. si prodscal(moyenne, vecteur orientation) > 0 on recule, < 0 on avance
  if(noMvt==1) {
    currentAutoMvt = false;
  } else{
    currentAutoMvt = true;
  }

  if((roboty[0] < parseFloat(zoneslocations[0].y)+1) && (roboty[0] > parseFloat(zoneslocations[0].y)-1) && (robotx[0] < parseFloat(zoneslocations[0].x) + 1) && (robotx[0] > parseFloat(zoneslocations[0].x)-1)) {
    if(!isFillingWater) {
      fillingWater();
      robotTankEmpty = false;
    }
  } else {
    stopFillingWater();
  }
  if((roboty[0] < parseFloat(zoneslocations[1].y)+1) && (roboty[0] > parseFloat(zoneslocations[1].y)-1) && (robotx[0] < parseFloat(zoneslocations[1].x) + 1) && (robotx[0] > parseFloat(zoneslocations[1].x)-1)) {
    if(!isFillingBattery) {
      fillingBattery();
    }
  } else {
    stopFillingBattery();
  }
  // heat simulation
  var equilibriumDist = 3.0;
//  var itNbBeforeChange = 1;
//  if(counter > itNbBeforeChange) {
    var minDistance = 3.5;
    for(var q = 0; q < treeslocations.length; q++) {
      if(firesStatesOfTrees[q]) {
        var distance = Math.sqrt(Math.pow(treeslocations[q].x - robotx[0], 2) + Math.pow(treeslocations[q].y - roboty[0], 2));
        minDistance = Math.min(minDistance, distance);
      }
    }
    var heatIncrement = (equilibriumDist - minDistance)*20 / equilibriumDist;
    mercurelevelfloat = mercurelevelfloat + heatIncrement;
    if(mercurelevelfloat > 270) {
      mercurelevelfloat = 270;
      overlayOpen = true;
      cause = 2;
      global.stopGame();
    }
    if(mercurelevelfloat>200 && !alarmSituations[1]){
      if(!alarmOverlayOpen && Math.random()>0.5){
        alarmOverlayOpen = true;	
        alarmCause = 1;
        alarmSituations[1] = true;
        writeAlarms.push(alarmCause);
      }
    }
    if(mercurelevelfloat<=200){
      alarmSituations[1] = false;
    }


    if(mercurelevelfloat < 50) {
      mercurelevelfloat = 50;
    }
    mercurelevel = mercurelevelfloat.toString()/70 + 'vw';
    hotscreen = mercurelevelfloat/300;

});
serverGet.bind(PORTGET, HOST);


//=====================================================
// heat simulation part 
//=====================================================

// give temp/screen effect to client
router.get('/temperature', function(req, res) {
  res.json([mercurelevel,hotscreen]);
});


//=====================================================
// create udp message for orocos containing angular/linear speed
//=====================================================
function speedToUdpMess(as, ls) {
  var NB_INTS = 50;
  var NB_FLOATS = 50;
  //var LGTH_BYTES = 8 + NB_FLOATS * 4 + NB_INTS * 2;
  var timestamp = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  var speed = new Float32Array(2);
  speed[0] = as;
  speed[1] = ls;
  var floats = new Float32Array(NB_FLOATS);
  floats[0] = speed[0];
  floats[1] = speed[1];
  for(var l = 2; l < NB_FLOATS; l++) {
    floats[l] = 0.0;
  }
  var floatsBytes = new Int8Array(floats.buffer);
  var integers = new Int16Array(50);
  for(var m = 0; m < NB_INTS; m++) {
    integers[m] = 0;
  }
  var integersBytes = new Int8Array(integers.buffer);
  var udpMess = new Int8Array(8 + 4*NB_FLOATS + 2*NB_INTS);
  for(var n = 0; n < 8; n++) {
    udpMess[n] = timestamp[n];
  }
  for(var o = 0; o < 4*NB_FLOATS; o++) {
    udpMess[o + 8] = floatsBytes[o];
  }
  for(var p = 0; p < 2*NB_INTS; p++) {
    udpMess[p + 8 + 4*NB_FLOATS] = integersBytes[p];
  }
  return udpMess;
}

//=====================================================
// controls (MOVES ~ speedToUdpMess & WATER ~ exec)
//=====================================================
//var sys = require('sys');
//var exec = require('child_process').exec;
function puts(error, stdout) {
  sys.puts(stdout);
}

router.get('/fires', function(req, res) {
  res.json(firesStatesOfTrees);
});
router.get('/fightedfires', function(req, res) {
  res.json(numFightedFires);
});


var udpMess;
var buffer;
var client;
var jwt = require('jwt-simple');
var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex');
var currentsplatch = false;
router.post('/', function(req, res/*, next*/) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      if(req.body.key == 'front') {
        writeUsedKeys.push('front');
        if(autonomousRobot==0){
          udpMess = speedToUdpMess(0.0, 0.6);
          buffer = new Buffer(udpMess);
          client = dgram.createSocket('udp4');
          client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
            if(err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
          });
          clearTimeout(timeoutOnManualAlarm);
        }
      } else if(req.body.key == 'left') {
        writeUsedKeys.push('left');
        if(autonomousRobot==0){
          udpMess = speedToUdpMess(0.05, 0.0);
          buffer = new Buffer(udpMess);
          client = dgram.createSocket('udp4');
          client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
            if(err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
          });
          clearTimeout(timeoutOnManualAlarm);
        }
      } else if(req.body.key == 'right') {
        writeUsedKeys.push('right');
        if(autonomousRobot==0){
          udpMess = speedToUdpMess(-0.05, 0.0);
          buffer = new Buffer(udpMess);
          client = dgram.createSocket('udp4');
          client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
            if(err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
          });
          clearTimeout(timeoutOnManualAlarm);
        }
      } else if(req.body.key == 'back') {
        writeUsedKeys.push('back');
        if(autonomousRobot==0){
          udpMess = speedToUdpMess(0.0, -0.6);
          buffer = new Buffer(udpMess);
          client = dgram.createSocket('udp4');
          client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
            if(err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
          });
          clearTimeout(timeoutOnManualAlarm);
        }
      } else if(req.body.key == 'space') {
        writeUsedKeys.push('space');
        if(autonomousRobot==0){
          throwWater();
          clearTimeout(timeoutOnManualAlarm);
        }
      }
      if(autonomousRobot==1 && !alarmSituations[4] && currentAutonomyTime>=3){
        if(!alarmOverlayOpen && Math.random()>0.5){
          alarmOverlayOpen = true;	
          alarmCause = 4;
          alarmSituations[4] = true;
          writeAlarms.push(alarmCause);
        }
      }
      res.json({
        posX: robotx,
        posY: roboty,
        orientation: roboto,
        waterlevel: watlevel,
	splatch: currentsplatch
      });
      setTimeout(function() {
          currentsplatch = false;
      }, 100);
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
});



// other key
router.post('/otherkey', function(req, res/*, next*/) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      if(req.body.key == 'otherkeyUp') {
        writeOthers.push('otherkeyUp');
        console.log("otherkey up");
      }
      if(req.body.key == 'otherkeyDown') {
        writeOthers.push('otherkeyDown');
        console.log("otherkey up");
      } 
      if(req.body.key == 'otherClick') {
        writeOthers.push('otherClick');
        console.log("other click");
      } 
      res.json({});
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
});




// give pos/orientation/splatch/automanual to client
router.get('/robot', function(req, res) {
  res.json([robotx[0],roboty[0],roboto[0],currentsplatch,autonomousRobot==1]);
});

// give end/gameover state
router.get('/finished', function(req, res) {
  res.json([overlayOpen,cause,finalNumFightedFiresSent,newBestScore,currentPseudo]);
});


router.get('/alarms', function(req, res) {
  res.json([alarmOverlayOpen,alarmCause]);
  //alarmCause = (alarmCause + 1)%6;
});

router.get('/removealarm', function(req, res) {
  writeClicks.push('removeAlarm');
  alarmOverlayOpen = false;
  res.json();
  //alarmCause = (alarmCause + 1)%6;
});


//=====================================================
// SPLATCH
//=====================================================
function throwWater() {

  if(watlevel >= 10) {
    var watlevelTemp = watlevel;
    watlevel = watlevel - 10;
    currentsplatch = true;
    console.log("throwWater() : !!!!!!!!!!!! I THROW WATER !!!!!!!!!!!!");
  } else {
    watlevel = 0;
    robotTankEmpty = true;
    currentsplatch = false;
  }

  // ALARM SHOOTS LEFT
  if(watlevel<=20 && watlevelTemp>20 && !alarmSituations[3]){
    if(!alarmOverlayOpen && Math.random()>0.5){
      alarmOverlayOpen = true;
      alarmCause = 3;
      alarmSituations[3] = true;
      writeAlarms.push(alarmCause);
    }
  }

  for(var i = 0; i < treeslocations.length; i++) {
    // close enough + good orientation
    var diffX = treeslocations[i].x - robotx[0];
    var diffY = treeslocations[i].y - roboty[0];
    var normDiff = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
    diffX = diffX / normDiff;
    diffY = diffY / normDiff;
    var robotoX = Math.cos(roboto);
    var robotoY = Math.sin(roboto);
    var scalprod = robotoX * diffX + robotoY * diffY;
    if((normDiff < 4) && (scalprod > 0.9) && firesStatesOfTrees[i] && !robotTankEmpty) {
      numFightedFires++;
      finalNumFightedFires++;
      finalNumFightedFiresSent++;
      var indexTree = i + 1;
      var command1 = 'echo \'' + treeslocations[i].x.toString() + ' ' + treeslocations[i].y.toString() + ' -10\' | yarp write /data/out /morse/treeonfire' + indexTree.toString() + '/teleporttf' + indexTree.toString() + '/in';
      var command2 = 'echo \'' + treeslocations[i].x.toString() + ' ' + treeslocations[i].y.toString() + ' -0.1\' | yarp write /data/out /morse/tree' + indexTree.toString() + '/teleport' + indexTree.toString() + '/in';
      setTimeout(function() {
         //console.log(command1 + ' && ' + command2);
         exec(command1 + ' && ' + command2, puts);
      }, 500);
      firesStatesOfTrees[i] = false;
    }
  }
  setTimeout(function() {
    currentsplatch = false; // TODO ca doit etre pour ca le double splatch
  }, 500); // enfin ça ;) -- update: maybe no bug anymore
}



//=====================================================
// create udp message for orocos position to reach
//=====================================================
function positionToUdpMess(x, y) {
  var NB_INTS = 50;
  var NB_FLOATS = 50;
  //var LGTH_BYTES = 8 + NB_FLOATS * 4 + NB_INTS * 2;
  var timestamp = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  var floats = new Float32Array(NB_FLOATS);
  floats[0] = 0.0;
  floats[1] = 0.0;
  floats[2] = x;
  floats[3] = y;
  for(var l = 4; l < NB_FLOATS; l++) {
    floats[l] = 0.0;
  }
  var floatsBytes = new Int8Array(floats.buffer);
  var integers = new Int16Array(NB_INTS);
  for(var m = 0; m < NB_INTS; m++) {
    if(m==IND_MODE) {
      integers[m] = autonomousRobot;
    } else{
      integers[m] = 0;
    }
  }
  var integersBytes = new Int8Array(integers.buffer);
  var udpMess = new Int8Array(8 + 4*NB_FLOATS + 2*NB_INTS);
  for(var n = 0; n < 8; n++) {
    udpMess[n] = timestamp[n];
  }
  for(var o = 0; o < 4*NB_FLOATS; o++) {
    udpMess[o + 8] = floatsBytes[o];
  }
  for(var p = 0; p < 2*NB_INTS; p++) {
    udpMess[p + 8 + 4*NB_FLOATS] = integersBytes[p];
  }
  return udpMess;
}


function abortMoveToUdpMess() {
  var NB_INTS = 50;
  var NB_FLOATS = 50;
  //var LGTH_BYTES = 8 + NB_FLOATS * 4 + NB_INTS * 2;
  var timestamp = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
  var floats = new Float32Array(NB_FLOATS);
  for(var l = 0; l < NB_FLOATS; l++) {
    floats[l] = 0.0;
  }
  var floatsBytes = new Int8Array(floats.buffer);
  var integers = new Int16Array(NB_INTS);
  for(var m = 0; m < NB_INTS; m++) {
    if(m==IND_MODE) {
      integers[m] = autonomousRobot;
    } else if(m==IND_ABORTMOVE){
      integers[m] = 1;
    }
  }
  var integersBytes = new Int8Array(integers.buffer);
  var udpMess = new Int8Array(8 + 4*NB_FLOATS + 2*NB_INTS);
  for(var n = 0; n < 8; n++) {
    udpMess[n] = timestamp[n];
  }
  for(var o = 0; o < 4*NB_FLOATS; o++) {
    udpMess[o + 8] = floatsBytes[o];
  }
  for(var p = 0; p < 2*NB_INTS; p++) {
    udpMess[p + 8 + 4*NB_FLOATS] = integersBytes[p];
  }
  return udpMess;
}




// TODO REMPLACER CA PAR UNE MISE A JOUR DES SCORES AVEC currentPseudo
/*router.post('/pseudo', function(req, res) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      if(req.body.pseudo!=''){
        scores[rank].name = req.body.pseudo;
        console.log("PSEUDO!!!");
        console.log(req.body.pseudo);
        var newChaine = JSON.stringify(scores);
        fs.writeFileSync('../driving-human-robots-interaction/scores.json', newChaine, 'UTF-8');
      }
      clearTimeout(endOfGameTimeOut);
      global.newtoken();
      res.json();
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
});*/

router.post('/pseudobegin', function(req, res/*, next*/) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      currentPseudo = req.body.pseudo;
      //console.log(req.body.pseudo);
      res.json();
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
});


router.post('/keyboard', function(req, res/*, next*/) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      keyboardShortcuts.push('keyboard');
      res.json();
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
});

var waterwidth = 0;
var wrenchmode = false;
var openingcontrol = 0;
var faucetcontrol = 0;
// send new state of control of water management to client
router.post('/watercontrol', function(req, res/*, next*/) {
  var repeater;
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      if(req.body.button == 'plusT') {
        writeClicks.push('plus');
        if(faucetcontrol < 3) {
	  faucetcontrol = faucetcontrol + 1;
        }
      } else if(req.body.button == 'minusT') {
        writeClicks.push('minus');
        if(faucetcontrol > -3) {
          faucetcontrol = faucetcontrol - 1;
        }
      } else if(req.body.button == 'pushButton') { // WATER PUSH BUTTON
        writeClicks.push('push');
        waterwidth = 7;
        var callCount = 1;
        clearInterval(repeater);
        repeater = setInterval(function () {
          if (callCount < 8) {
            waterwidth = 7 - callCount;
            callCount += 1;
          } else {
            clearInterval(repeater);
          }
        }, 1000);
      } else if(req.body.button == 'wrenchButton') { // WRENCH
        writeClicks.push('wrench');
        wrenchmode = !wrenchmode;
      } else if(req.body.button == 'clickLeak') { // CLICK AT LEAK
        writeClicks.push('clickLeak' + req.body.leakid);
        if(wrenchmode) {
          noleakat[req.body.leakid] = true;
          wrenchmode = false;
        }
         

        var leakSomewhere = false;
        for(var i = 0; i<leakPlacesNb; i++){
          leakSomewhere = leakSomewhere || !noleakat[i];
        }
/*
	if (!leakSomewhere) {
          alarmSituations[6] = false;
        }
*/
      } 
/*else if(req.body.button == 'newContainer') { // AND FINALLY "NEW CONTAINER"
        brokenContainer = false;
        for (var i=0; i<leakPlacesNb; i++) {
          noleakat[i] = true;
        }
        crossSize = 0;
      }*/
      res.json({
        tapControl: faucetcontrol,
        wrenchMode: wrenchmode,
        noLeakAt: noleakat/*,
        brokenContainer: brokenContainer,
        crossSize: crossSize*/
      });
    }
    else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
});

// give tap position, valve opening and water level of the container to client
router.get('/watermanagement', function(req, res) {
  res.json([xrobinet,waterwidth,watlevelContainer]);
});





var fillBatteryInterval;
var isFillingBattery = false;
var fillingBattery = function() {
  isFillingBattery = true;
  clearInterval(fillBatteryInterval);
  fillBatteryInterval = setInterval(function() {
    if(batteryLevel <= 95) {
      batteryLevel = batteryLevel + 5;
    } else if(batteryLevel<100){
      batteryLevel = 100;
    }
  }, 500);
};
var stopFillingBattery = function() {
  clearInterval(fillBatteryInterval);
  isFillingBattery = false;
};



// UDP indexes
var IND_MODE = 1
var IND_ENDGOTO = 2
var IND_ABORTMOVE = 3
var ixe = zoneslocations[0].x;
var igrec = zoneslocations[0].y;
var firstTime = false;
var tempxy = 1.0;
var wstream;


//var brokenContainer = false;
router.get('/leaks', function(req, res) {
  res.json([leakPlaces,noleakat/*,brokenContainer,crossSize*/]);
});
router.get('/battery', function(req, res) {
  res.json(batteryLevel);
});
router.get('/time', function(req, res) {
  res.json(remainingtime);
});

export function launchgame(req, res) {
  console.log("!! CONTROL -- LAUNCHGAME !!");
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires ){
/*
      fs.writeFile("/home/drougard/robotfirefighter/test.txt", "Test write", function(err){
        if(err){
          return console.log(err); 
        }
        console.log("FILE SAVED!");
      });
*/ 
      var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
      if(typeof wstream !== 'undefined' && wstream){
        wstream.end();
      }
      var date = new Date();
      // new file at each game, with date and time ex: record_2017_09_04__03_11.txt
      wstream = fs.createWriteStream('records/record_' + date.getFullYear() + '_' + ('0' + (date.getMonth()+1)).slice(-2) + '_' + ('0' + date.getDate()).slice(-2) + '__' + ('0' + date.getHours()).slice(-2) + '_' + ('0' + date.getMinutes()).slice(-2) + '.txt');
      wstream.write('# ip: ' + ip + '\n');
      wstream.write('# remaining_time, autonomous_robot, alarm, robot_x, robot_y, robot_angle, trees_state, battery_level, temperature, water_level, ground_tank_water_level, leaks_number, used_keys, clicks, others, keyboard_shortcuts \n');
      
      var stringWriteAlarms = "";
      if (writeAlarms.length>0){
        for(var i=0;i<writeAlarms.length;i++){
          var comma = "\'";
          if(i>0){
            comma = ',';
          }
          stringWriteAlarms = stringWriteAlarms + comma + writeAlarms[i];
        }
      } else{
        stringWriteAlarms = "\'-1";
      }
      stringWriteAlarms = stringWriteAlarms + "\'";

      var stringWriteTreesStates = "";
      for(var i=0;i<firesStatesOfTrees.length;i++){
        var comma = '';
        if(i>0){
          comma = ',';
        } else{
          comma = "\'";
        }
        stringWriteTreesStates = stringWriteTreesStates + comma + firesStatesOfTrees[i];
      }
      stringWriteTreesStates = stringWriteTreesStates + "\'";

      var stringWriteleaks = "";
      for(var i=0;i<noleakat.length;i++){
        var comma = '';
        if(i>0){
          comma = ',';
        } else{
          comma = "\'";
        }
        stringWriteleaks = stringWriteleaks + comma + !noleakat[i];
      }
      stringWriteleaks = stringWriteleaks + "\'";


      var stringWriteUsedKeys = "";
      if (writeUsedKeys.length>0){
        for(var i=0;i<writeUsedKeys.length;i++){
          var comma = "\'";
          if(i>0){
            comma = ',';
          }
          stringWriteUsedKeys = stringWriteUsedKeys + comma + writeUsedKeys[i];
        }
      } else{
        stringWriteUsedKeys = "\'-1";
      }
      stringWriteUsedKeys = stringWriteUsedKeys + "\'";
	
      var stringWriteClicks = "";
      if (writeClicks.length>0){
        for(var i=0;i<writeClicks.length;i++){
          var comma = "\'";
          if(i>0){
            comma = ',';
          }
          stringWriteClicks = stringWriteClicks + comma + writeClicks[i];
        }
      } else{
        stringWriteClicks = "\'-1";
      }
      stringWriteClicks = stringWriteClicks + "\'";

      var stringWriteOthers = "";
      if (writeOthers.length>0){
        for(var i=0;i<writeOthers.length;i++){
          var comma = "\'";
          if(i>0){
            comma = ',';
          }
          stringWriteOthers = stringWriteOthers + comma + writeOthers[i];
        }
      } else{
        stringWriteOthers = "\'-1";
      }
      stringWriteOthers = stringWriteOthers + "\'";


      var stringKeyboardShortcuts = "";
      if (keyboardShortcuts.length>0){
        for(var i=0;i<keyboardShortcuts.length;i++){
          var comma = "\'";
          if(i>0){
            comma = ',';
          }
          stringKeyboardShortcuts = stringKeyboardShortcuts + comma + keyboardShortcuts[i];
        }
      } else{
        stringKeyboardShortcuts = "\'-1";
      }
      stringKeyboardShortcuts = stringKeyboardShortcuts + "\'"; 



      writeAlarms = [];
      writeUsedKeys = [];
      writeClicks = [];
      writeOthers = [];
      keyboardShortcuts = [];



      // creer un interval toutes (freq demi seconde) qui fait le wstream.write() d'une ligne bien formatée
      // creer une variable par info qui se vide apres avoir ecrit
      // temps, ACTIONS: autonomous/manual, alarmes, STATES: position du robot, etat des arbres, batterylevel, temp, 
//watlevel, watertanklevel, nbleaks, HAI: touches claviers, cliks
 
      // clear intervals 
      clearInterval(waterManagementInterval);
      clearInterval(leaksInterval);
      clearInterval(waterFlowInterval);
      clearInterval(timeInterval);
      clearInterval(batteryInterval);
      clearInterval(treeBurningInterval);
      clearInterval(fillWaterInterval);
      clearInterval(fillBatteryInterval);
      clearInterval(autonomyInterval);
      clearInterval(automanualInterval);

      // make sure the initialization is correct 
      abortSession = false;
      firstTime = true;
      currentGoalX = 0.0;
      currentGoalY = 0.0;
      currentGoalTreeI = -1;
      currentAvoidTree = false;
      currentAvoidTreeSession = false;
      goalIsATree = false;
      batteryNeeded = false;
      batteryNeededSession = false;
      waterNeeded = false;
      
      clearTimeout(timeoutOnManualAlarm);
      overlayOpen = false;
      cause = 0;

      alarmOverlayOpen = false;
      alarmCause = 0;
      alarmSituations = [false,false,false,false,false,false];

      writeAlarms = [];
      writeUsedKeys = [];
      writeClicks = [];
      writeOthers = [];
      keyboardShortcuts = [];

      newBestScore = false;
      rewardsSum = 0;
      rank = 0;

      autonomousRobot = 0
      xrobinet = 42;
      mercurelevelfloat = 10;
      mercurelevel = '0.1vw';
      hotscreen = 0;
      firesStatesOfTrees = [];
      for(var i=0; i<treeslocations.length;i++) {
        firesStatesOfTrees.push(false);
      }
      watlevel = 50;
      robotTankEmpty = false;
      isFillingWater = false;
      leakPlacesNb = 9;
      leakPlaces = [];
      noleakat = [];
      leakCounter = 0;
      for (var i=0; i<leakPlacesNb; i++) {
        leakPlaces.push(leakCounter);
        leakCounter++;
        noleakat.push(true);
      }
      vlvop = 1;
      watlevelContainer = 50;
      remainingtime = 600;
      batteryLevel = 100;
      numFightedFires = 0;
      finalNumFightedFires = 0;
      finalNumFightedFiresSent = 0;

      wstream.write(remainingtime + ', ' + autonomousRobot + ', ' + stringWriteAlarms + ', ' + robotx + ', ' + roboty + ', ' + roboto + ', ' + stringWriteTreesStates + ', ' + batteryLevel + ', ' + mercurelevelfloat + ', ' + watlevel + ', ' + watlevelContainer + ', ' + stringWriteleaks + ', ' + stringWriteUsedKeys + ', ' + stringWriteClicks + ', ' + stringWriteOthers + ', ' + stringKeyboardShortcuts + '\n');
      for(var i = 0; i<firesStatesOfTrees.length;i++){
        if(!firesStatesOfTrees[i]){
          rewardsSum = rewardsSum+1;
        }
      }

      // RANDOM AUTONOMOUS/MANUAL EVERY 10secs
      automanualInterval = setInterval(function() {
        var myAlea = Math.random();
        // WITH PROBA 0.5   
        if(myAlea>0.5){ 
          // REMAINS OR BECOMES MANUAL ROBOT
          if(autonomousRobot==1){
            batteryNeededSession = false;
            waterNeededSession = false;
            // abort
            var udpMess = abortMoveToUdpMess();
            var buffer = new Buffer(udpMess);
            var client = dgram.createSocket('udp4');
            client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
              if(err) throw err;
              console.log('Change to manual: abort 1 sent to ' + HOST +':'+ PORT);
              client.close();
            });
            setTimeout(function() {
              var udpMess1 = abortMoveToUdpMess();
              var buffer1 = new Buffer(udpMess1);
              var client1 = dgram.createSocket('udp4');
              client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('Change to manual: abort 2 sent to ' + HOST +':'+ PORT);
                client1.close();
              });
            }, 500);
            setTimeout(function() {
              var udpMess2 = abortMoveToUdpMess();
              var buffer2 = new Buffer(udpMess2);
              var client2 = dgram.createSocket('udp4');
              client2.send(buffer2, 0, buffer2.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('Change to manual: abort 3 sent to ' + HOST +':'+ PORT);
                client2.close();
              });
            }, 1000);
            // not in autonomous mode anymore
            alarmSituations[4] = false;
            // declare it with proba 0.5 (if not avoided by the use of the keyboard)
            timeoutOnManualAlarm = setTimeout(function() {
              if(!alarmOverlayOpen && Math.random()>0.5 && !alarmSituations[5]){
                alarmOverlayOpen = true;
                alarmCause = 5;
                alarmSituations[5] = true;
                writeAlarms.push(alarmCause);
              }
            }, 3000);
            autonomousRobot = 0; // MANUAL ROBOT
          } 
        } else if(autonomousRobot==0){ // OR REMAINS OR BECOMS AUTONOMOUS
          // reset variables related the autonomous expert strategy
          abortSession = false;
          //firstTime = true;
          currentGoalX = 0.0;
          currentGoalY = 0.0;
          currentGoalTreeI = -1;
          currentAvoidTree = false;
          currentAvoidTreeSession = false;
          goalIsATree = false;
          //batteryNeeded = false;
          batteryNeededSession = false;
          waterNeededSession = false;
          //waterNeeded = false;
          alarmSituations[5] = false; // can be declared as not in manual mode anymore in alarms
          currentAutonomyTime = 0;
          autonomousRobot = 1; // AUTONOMOUS ROBOT 
          console.log('Change to autonomous: reset variables');
        }
      }, 10000);


      //=====================================================
      // Robot Autonomy
      //=====================================================
      autonomyInterval = setInterval(function() {
        console.log("Robot Autonomy -- MAIN INTERVAL");

        if( (autonomousRobot==1) && batteryNeeded && !batteryNeededSession){ 
          waterNeeded = false;
          waterNeededSession = false;
          var udpMess1 = abortMoveToUdpMess();
          var buffer1 = new Buffer(udpMess1);
          var client1 = dgram.createSocket('udp4');
          console.log("!!!!!!!!!!!! send abort to robot batteryNeeded !!!!!!!!!!!!");
          client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
            if(err) throw err;
            console.log('abort sent to ' + HOST +':'+ PORT);
            client1.close();
       
            setTimeout(function() {
              var client1 = dgram.createSocket('udp4');
              console.log("!!!!!!!!!!!! send abort to robot 2 batteryNeeded !!!!!!!!!!!!");
              client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('abort sent to ' + HOST +':'+ PORT);
                client1.close();
              });
            }, 500);
      
            setTimeout(function() {
              var client1 = dgram.createSocket('udp4');
              console.log("!!!!!!!!!!!! send abort to robot 3 batteryNeeded !!!!!!!!!!!!");
              client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('abort sent to ' + HOST +':'+ PORT);
                client1.close();
              });
            }, 1000); 
 
            setTimeout(function() {
              var client1 = dgram.createSocket('udp4');
              console.log("!!!!!!!!!!!! send abort to robot 4 batteryNeeded !!!!!!!!!!!!");
              client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('abort sent to ' + HOST +':'+ PORT);
                client1.close();
              });
            }, 1500); 

            setTimeout(function() {
              var client1 = dgram.createSocket('udp4');
              console.log("!!!!!!!!!!!! send abort to robot 5 batteryNeeded !!!!!!!!!!!!");
              client1.send(buffer1, 0, buffer1.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('abort sent to ' + HOST +':'+ PORT);
                client1.close();
              });
            }, 2000); 

            setTimeout(function() {
              var gotoX = zoneslocations[1].x;
              var gotoY = zoneslocations[1].y;
              goalIsATree = false;
              var udpMess2 = positionToUdpMess(gotoX,gotoY);
              var buffer2 = new Buffer(udpMess2);
              var client2 = dgram.createSocket('udp4');
              console.log("!!!!!!!!!!!! send GOTO BATTERY to robot !!!!!!!!!!!!");
              client2.send(buffer2, 0, buffer2.length, PORT, HOST, function(err) {
                if(err) throw err;
                console.log('position to reach sent to ' + HOST +':'+ PORT);
                client2.close();
              });
              currentGoalX = gotoX;
              currentGoalY = gotoY;
            }, 2500);            

          });
          batteryNeededSession = true;
        }


        if( (autonomousRobot==1) && (!currentAutoMvt || firstTime) && !batteryNeeded && !waterNeededSession && !currentAvoidTreeSession){
          firstTime = false; // because currentAutoMvt = !completed (in deployer.lua) et completed = false si aucun mvt n'a été fait dans cette session
          console.log("AUTONOMY INTERVAL -- classic goto part");
          // TODO gérer le premier cas!
          var gotoX = zoneslocations[1].x; 
          var gotoY = zoneslocations[1].y;

          if (waterNeeded){
            var gotoX = zoneslocations[0].x; 
            var gotoY = zoneslocations[0].y;
            waterNeededSession = true;
            goalIsATree = false;
          }
          else{
            goalIsATree = false;
            var minDistance = 10000;
            var gotoI = -1;
            for(var i=0;i<firesStatesOfTrees.length;i++) {
              if (firesStatesOfTrees[i]){
                var distanceFromTree = Math.sqrt(Math.pow(treeslocations[i].x - robotx[0], 2) + Math.pow(treeslocations[i].y - roboty[0], 2));
                var prevMinDistance = minDistance;
                minDistance = Math.min(minDistance, distanceFromTree)
                if(prevMinDistance > minDistance){
                  gotoI = i;
                }
              }
            }
            if(gotoI!=-1){
              gotoX = treeslocations[gotoI].x;
              gotoY = treeslocations[gotoI].y;
              goalIsATree = true;
            }
          }

          // vector departure -> arrival computation
          var vecteurX = gotoX - robotx[0];
          var vecteurY = gotoY - roboty[0];
          var normDirection = Math.sqrt(Math.pow(vecteurX, 2) + Math.pow(vecteurY, 2));
          vecteurX = vecteurX/normDirection;
          vecteurY = vecteurY/normDirection;

          // + rotation pour bien cadrer?
          ixe = gotoX; //- vecteurX*1.5;
          igrec = gotoY; //- vecteurY*1.5;

          udpMess = positionToUdpMess(ixe,igrec);
          buffer = new Buffer(udpMess);
          client = dgram.createSocket('udp4');

          console.log("!!!!!!!!!!!! send GOTO to robot !!!!!!!!!!!!");
          console.log("======= " + ixe + "======= " + igrec );
          client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
            if(err) throw err;
            //console.log('position to reach sent to ' + HOST +':'+ PORT);
            client.close();
          });
          currentGoalX = ixe;
          currentGoalY = igrec;
          currentGoalTreeI = gotoI;
          abortSession = false;
        }

      }, 2000);


      //=====================================================
      // tree burning randomization 
      //=====================================================
      var alea1 = -1;
      var alea2 = -1;
      var treenumber = -1;
      var onfire = false;
      var timerStart = 0;
      treeBurningInterval = setInterval(function() {
        alea1 = Math.random();
        alea2 = Math.random();
        treenumber = Math.floor(alea1 * treeslocations.length);
        onfire = false;
        if(alea2 < 0.33333) {
          onfire = true;
        }
        if(onfire && (treenumber != -1) && !firesStatesOfTrees[treenumber]) {
          firesStatesOfTrees[treenumber] = true;
          // update states of fires to show them on the map
          var indexTree = treenumber + 1;
          var command1 = 'echo \'' + treeslocations[treenumber].x.toString() + ' ' + treeslocations[treenumber].y.toString() + ' -0.1\' | yarp write /data/out /morse/treeonfire' + indexTree.toString() + '/teleporttf' + indexTree.toString() + '/in';
          var command2 = 'echo \'' + treeslocations[treenumber].x.toString() + ' ' + treeslocations[treenumber].y.toString() + ' -10\' | yarp write /data/out /morse/tree' + indexTree.toString() + '/teleport' + indexTree.toString() + '/in';
          var command = command2 + ' && ' + command1;
          //console.log(command);
          exec(command, puts);
        }
        //console.log('new fire ? ' + treenumber + ' ' + onfire);
      }, 3000);


      //=====================================================
      // water management part: 
      //=====================================================
      var pivalue = 3.1415;
      var valveopening = 1;
      var widthwaterflow = 10 - Math.abs(vlvop);
      var coeffspeed = 20;
      var coeffspeedopening = 0.1;
      var faucetxaxis = 2 * 10 / 40;
      waterManagementInterval = setInterval(function() {
        if((xrobinet <= 80) && (xrobinet >= 0)) {
          xrobinet = xrobinet + coeffspeed * (pivalue / 80) * Math.sin(pivalue * xrobinet / 40 - pivalue) + faucetcontrol;
        } else if(xrobinet > 80) {
          xrobinet = 80;
        } else if(xrobinet < 0) {
            xrobinet = 0;
        }
        var fxa = (xrobinet - 40) * 10 / 40;
        faucetxaxis = fxa.toPrecision(1);
        if((vlvop <= 10) && (vlvop >= 0)) {
          vlvop = vlvop + coeffspeedopening * (pivalue / 10) * Math.sin(pivalue * vlvop / 5 - pivalue) + coeffspeedopening * openingcontrol;
          var tempvar = vlvop.toPrecision(1);
        } else if(vlvop > 10) {
          vlvop = 10;
        } else if(vlvop < 0) {
          vlvop = 0;
        }
        var temp = (vlvop - 5) * 10 / 5;
        valveopening = temp.toPrecision(1);
        widthwaterflow = 10 - Math.abs(temp);
      }, 200);


      waterFlowInterval = setInterval(function() {
        var leaksSum = 0;
        for(var i = 0; i<leakPlacesNb; i++) {
          if(!noleakat[i]){
            leaksSum = leaksSum + 1;
          }
        }
        if((faucetxaxis < 2) && (faucetxaxis > -2) && watlevelContainer < 100) {
          watlevelContainer = watlevelContainer + waterwidth/7 - leaksSum/(2*leakPlacesNb); 
        } else if (watlevelContainer > 1){
          watlevelContainer = watlevelContainer - leaksSum/leakPlacesNb;
        }
        if (watlevelContainer<0){
          watlevelContainer = 0;
        }
        if (watlevelContainer>100){
          watlevelContainer = 100;
        }
// TODO PBM HERE, NO HOPE ALARM WILL NOT POP (random every 200ms!!)
// idea: on ne retire pas au sort si watlevelContainer n'était pas >=15
        if (watlevelContainer<15 && !alarmOverlayOpen && Math.random()>0.5 && !alarmSituations[7]){
          alarmOverlayOpen = true;
          alarmCause = 7;
          alarmSituations[7] = true;
          writeAlarms.push(alarmCause);
        }
        if (watlevelContainer>=25){
          alarmSituations[7] = false;
        }

      }, 200);


  //=====================================================
  // remaining time part
  //=====================================================
      timeInterval = setInterval(function() {
        if(remainingtime > 0) {
          remainingtime = remainingtime - 1;
          if(remainingtime<=60 && !alarmSituations[2]){
            if(!alarmOverlayOpen && Math.random()>0.5){
              alarmOverlayOpen = true;
              alarmCause = 2;
              alarmSituations[2] = true;
              writeAlarms.push(alarmCause);
            }
          }
          
          var stringWriteAlarms = "";
          if (writeAlarms.length>0){
            for(var i=0;i<writeAlarms.length;i++){
              var comma = "\'";
              if(i>0){
                comma = ',';
              }
              stringWriteAlarms = stringWriteAlarms + comma + writeAlarms[i];
            }
          } else{
            stringWriteAlarms = "\'-1";
          }
          stringWriteAlarms = stringWriteAlarms + "\'";
          
          var stringWriteTreesStates = "";
          for(var i=0;i<firesStatesOfTrees.length;i++){
            var comma = '';
            if(i>0){
              comma = ',';
            } else{
              comma = "\'";
            }
            stringWriteTreesStates = stringWriteTreesStates + comma + firesStatesOfTrees[i];
          }
          stringWriteTreesStates = stringWriteTreesStates + "\'";

          
          var stringWriteleaks = "";
          for(var i=0;i<noleakat.length;i++){
            var comma = '';
            if(i>0){
              comma = ',';
            } else{
              comma = "\'";
            }
            stringWriteleaks = stringWriteleaks + comma + !noleakat[i];
          }
          stringWriteleaks = stringWriteleaks + "\'";

          var stringWriteUsedKeys = "";
          if (writeUsedKeys.length>0){
            for(var i=0;i<writeUsedKeys.length;i++){
              var comma = "\'";
              if(i>0){
                comma = ',';
              }
              stringWriteUsedKeys = stringWriteUsedKeys + comma + writeUsedKeys[i];
            }
          } else{
            stringWriteUsedKeys = "\'-1";
          }
          stringWriteUsedKeys = stringWriteUsedKeys + "\'";

          var stringWriteClicks = "";
          if (writeClicks.length>0){
            for(var i=0;i<writeClicks.length;i++){
              var comma = "\'";
              if(i>0){
                comma = ',';
              }
              stringWriteClicks = stringWriteClicks + comma + writeClicks[i];
            }
          } else{
            stringWriteClicks = "\'-1";
          }
          stringWriteClicks = stringWriteClicks + "\'";


          var stringWriteOthers = "";
          if (writeOthers.length>0){
            for(var i=0;i<writeOthers.length;i++){
              var comma = "\'";
              if(i>0){
                comma = ',';
              }
              stringWriteOthers = stringWriteOthers + comma + writeOthers[i];
            }
          } else{
            stringWriteOthers = "\'-1";
          }
          stringWriteOthers = stringWriteOthers + "\'";

          var stringKeyboardShortcuts = "";
          if (keyboardShortcuts.length>0){
            for(var i=0;i<keyboardShortcuts.length;i++){
              var comma = "\'";
              if(i>0){
                comma = ',';
              }
              stringKeyboardShortcuts = stringKeyboardShortcuts + comma + keyboardShortcuts[i];
            }
          } else{
            stringKeyboardShortcuts = "\'-1";
          }
          stringKeyboardShortcuts = stringKeyboardShortcuts + "\'"; 


          wstream.write(remainingtime + ', ' + autonomousRobot + ', ' + stringWriteAlarms + ', ' + robotx + ', ' + roboty + ', ' + roboto + ', ' + stringWriteTreesStates + ', ' + batteryLevel + ', ' + mercurelevelfloat + ', ' + watlevel + ', ' + watlevelContainer + ', ' + stringWriteleaks + ', ' + stringWriteUsedKeys + ', ' + stringWriteClicks + ', ' + stringWriteOthers + ', ' + stringKeyboardShortcuts + '\n');

          // TODO ICI AJOUTER LE CLIENT TCP ENVOYANT A MINISERVER.PY
	  // CONTENANT LE SCRIPT DE STREAM LSL
          var LSLstring = remainingtime + ' ' + autonomousRobot + ' ' + stringWriteAlarms + ' ' + robotx + ' ' + roboty + ' ' + roboto + ' ' + stringWriteTreesStates + ' ' + batteryLevel + ' ' + mercurelevelfloat + ' ' + watlevel + ' ' + watlevelContainer + ' ' + stringWriteleaks + ' ' + stringWriteUsedKeys + ' ' + stringWriteClicks + ' ' + stringWriteOthers + ' ' + stringKeyboardShortcuts;
          console.log(LSLstring);
          clientTCP.write(LSLstring);
//            clientTCP.destroy();
/*
float: 0,1,3,4,5,7,8,9,10
*/

/*
clientTCP.on('data', function(data) {
  console.log('Received: ' + data);
  //clientTCP.destroy(); // kill client after server's response
});
*/
/*




          client.on('close', function() {
	    console.log('Connection closed');
          });
*/          

          writeAlarms = [];
          writeUsedKeys = [];
          writeClicks = [];
          writeOthers = []; 
          keyboardShortcuts = [];

          for(var i = 0; i<firesStatesOfTrees.length;i++){
            if(!firesStatesOfTrees[i]){
              rewardsSum = rewardsSum+1;
            }
          }
        }
        else{
          overlayOpen = true;
          cause = 0;
          global.stopGame();
        }
        console.log("oooooooooooooooooooooooooooooooooo");
        console.log('  REMAINING TIME: ' + remainingtime);
        console.log("oooooooooooooooooooooooooooooooooo");
        if(autonomousRobot==1){
          currentAutonomyTime = currentAutonomyTime + 1;
        }
      }, 1000);
      // give remaining time to client
  


  //=====================================================
  // battery part 
  //=====================================================
      console.log("CONTROL: battery part ");
      batteryInterval = setInterval(function() {
        if(batteryLevel > 0) {
          batteryLevel = batteryLevel - 1;
        }
	else{
	  overlayOpen = true;
          cause = 1;
          global.stopGame();
        }
      }, 2000);
      // give battery level to client
  

  //=====================================================
  // leaks/container part
  //=====================================================

    
  // RANDOM LEAKS
      //console.log("CONTROL: RANDOM LEAKS");
      leaksInterval = setInterval(function() {
        var leakSomewhere = false;
        if(Math.random()<0.5) {
          var myInt = Math.floor(Math.random()*leakPlacesNb);
          noleakat[myInt] = false;
          for(var i = 0; i<leakPlacesNb; i++){
            leakSomewhere = leakSomewhere || !noleakat[i];
          }
        }
/*
	if(!alarmOverlayOpen && Math.random()>0.5 && leakSomewhere && !alarmSituations[6]){
          alarmOverlayOpen = true; // TODO ALARM HAS TO BE RANDOM
          alarmCause = 6;
          alarmSituations[6] = true;
        }*/
      }, 5000);


      res.status(200).json("launched!");
    } else{
      res.status(401).json("Invalid token");
    }
  }
  else{
    res.status(401).json("No token given");
  }
}



//=====================================================
// robot tank
//=====================================================
// define fill/stopfill water functions
/*
var fillWaterInterval;
var robotTankEmpty = false;
var isFillingWater = false;
*/
var fillingWater = function() {
  if(watlevel>=30){
    alarmSituations[3] = false;
  }
  isFillingWater = true;
  clearInterval(fillWaterInterval);
  fillWaterInterval = setInterval(function() {
    if( (watlevel < 100) && (watlevelContainer >= 10) ) {
      watlevel = watlevel + 10;
      watlevelContainer = watlevelContainer - 10;
      if(watlevel>100){
        watlevel = 100;
      }
    }
  }, 500);
};
var stopFillingWater = function() {
  clearInterval(fillWaterInterval);
  isFillingWater = false;
};
// give watlevel to client
router.get('/robotwater', function(req, res) {
  res.json([watlevel,robotTankEmpty]);
});

//var endOfGameTimeOut;
// used in auth
global.stopGame = function() {

  if (finalNumFightedFires>0){

    var mychain = fs.readFileSync('../driving-human-robots-interaction/scores.json', 'UTF-8');
    scores = JSON.parse(mychain);

    // rank computation
    rank = 0;
    // TODO comparer .reward plutot que .score pour raffiner 
    while(rank<scores.length && scores[rank].score>=finalNumFightedFires){
      rank++;
      console.log("while...");
    }
    console.log("rank");
    console.log(rank);
    console.log("finalNumFightedFires");
    console.log(finalNumFightedFires);
    // score in the first page
    if(rank<10){
      console.log("YES, WE HAVE A WINNER!");
      newBestScore = true;
    }

    // last score
    if(scores.length==rank){

      // building last score
      var newPseudo = '';
      if(currentPseudo==''){
        // anonym pseudo generation
        newPseudo = "anonym" + rewardsSum;
      }else{
        newPseudo = currentPseudo;
      }
      var newScore = finalNumFightedFires;
      var date = new Date();
      var MyDateString = ('0' + (date.getMonth()+1)).slice(-2) + '/'
             + ('0' + date.getDate()).slice(-2) + '/'
             + date.getFullYear();
      var newDate =  MyDateString + ', ' + ('0' + date.getHours()).slice(-2) + ':' + ( '0' + date.getMinutes()).slice(-2);
      var newReward = rewardsSum;
      var newObject = {"name":newPseudo,"score":newScore,"date":newDate,"reward":newReward};
      scores.push(newObject);

    }else{ // not last score

      var newObject = scores[scores.length-1];
      scores.push(newObject);
      for(var i=scores.length-1; i>rank; i--){
        scores[i].name = scores[i-1].name;
        scores[i].score = scores[i-1].score;
        scores[i].date = scores[i-1].date;
        scores[i].reward = scores[i-1].reward;
      }
  
      if(currentPseudo==''){
        // anonym pseudo generation
        scores[rank].name = "anonym" + rewardsSum;
      }else{
        scores[rank].name = currentPseudo;
      }
      scores[rank].score = finalNumFightedFires;
      var date = new Date();
      var MyDateString = ('0' + (date.getMonth()+1)).slice(-2) + '/'
             + ('0' + date.getDate()).slice(-2) + '/'
             + date.getFullYear();
      scores[rank].date =  MyDateString + ', ' + ('0' + date.getHours()).slice(-2) + ':' + ( '0' + date.getMinutes()).slice(-2);
      scores[rank].reward = rewardsSum;
    }

    // overwrite score file
    var newChaine = JSON.stringify(scores);
    fs.writeFileSync('../driving-human-robots-interaction/scores.json', newChaine, 'UTF-8');

  }

  // reset variables
  finalNumFightedFires = 0;
  rewardsSum = 0;

  global.newtoken();

// TODO: global.newtoken(); lorsqu'on a 
/*  endOfGameTimeOut = setTimeout(function() {
    global.newtoken();
  }, 60000);*/ 

  exec('bash ~/driving-human-robots-interaction/killAll.sh');

  // clear intervals 
  clearInterval(waterManagementInterval);
  clearInterval(leaksInterval);
  clearInterval(waterFlowInterval);
  clearInterval(timeInterval);
  clearInterval(batteryInterval);
  clearInterval(treeBurningInterval);
  clearInterval(fillWaterInterval);
  clearInterval(fillBatteryInterval);
  clearInterval(autonomyInterval);
  clearInterval(automanualInterval);

  if(typeof wstream !== 'undefined' && wstream){
    wstream.end();
  }
  alarmOverlayOpen = false;
  alarmCause = 0;
  alarmSituations = [false,false,false,false,false,false];
  abortSession = false;
  firstTime = false;
  currentGoalX = 0.0;
  currentGoalY = 0.0;
  currentGoalTreeI = -1;
  currentAvoidTree = false;
  currentAvoidTreeSession = false;
  goalIsATree = false;
  batteryNeeded = false;
  batteryNeededSession = false;
  waterNeeded = false;
  waterNeededSession = false;

//  currentPseudo = '';
  currentAutonomyTime = 0;
  autonomousRobot = 0;

  writeAlarms = [];
  writeUsedKeys = [];
  writeClicks = [];
  writeOthers = [];
  keyboardShortcuts = [];

  xrobinet = 42;
  mercurelevelfloat = 10;
  mercurelevel = '0.1vw';
  hotscreen = 0;
  firesStatesOfTrees = [];
  for(var i=0; i<treeslocations.length;i++) {
    firesStatesOfTrees.push(false);
  }
  watlevel = 50;
  robotTankEmpty = false;
  isFillingWater = false;
  //crossSize = 0;
  leakPlacesNb = 9;
  leakPlaces = [];
  noleakat = [];
  leakCounter = 0;
  for (var i=0; i<leakPlacesNb; i++) {
    leakPlaces.push(leakCounter);
    leakCounter++;
    noleakat.push(true);
  }
  vlvop = 1;
  watlevelContainer = 50;
  remainingtime = "few";
  batteryLevel = 100;
  numFightedFires = 0;

}
// déja dans auth
// check expiration of tokens
/*
var checkExpiration = setInterval(function() {
  if( global.expires <= Date.now() ) {
    emptySlot = true;
    console.log("Auth -- expiration of current token, creation of a new one. ")
    global.expires = moment().add('minutes', 11).valueOf();
    payload = { auth: true,
              exp: global.expires };
    global.token = jwt.encode(payload, secret);
    console.log('Auth -- kill game.')
    exec('bash ~/driving-human-robots-interaction/killAll.sh');
  }
}, 3000);
*/
module.exports = router;
