'use strict';
var express = require('express');
var router = express.Router();

//=====================================================
// define trees locations using treeslocs.json
//=====================================================
var fs = require('fs');
var chaine = fs.readFileSync('/home/drougard/driving-human-robots-interaction/treeslocs.json', 'UTF-8');
var treeslocations = JSON.parse(chaine);
console.log('TREES LOCATIONS');
console.log(treeslocations[0].x);
router.get('/', function(req, res) {
  res.json(chaine);
});

//=====================================================
// define zones locations using zones.json
//=====================================================
var chaine2 = fs.readFileSync('/home/drougard/driving-human-robots-interaction/zones.json', 'UTF-8');
var zoneslocations = JSON.parse(chaine2);
console.log('ZONES LOCATIONS');
console.log(zoneslocations[0].x);
router.get('/zones', function(req, res) {
  res.json(chaine2);
});

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
serverGet.on('message', function(message, remote) {
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
  if(false) {
    console.log(remote.address + ':' + remote.port + ' - ' + posX + '  ' + posY + '  ' + orientation);
  }
  robotx = posX;
  roboty = posY;
  roboto = orientation;
  // use fill/stop fill water functions
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
  var itNbBeforeChange = 120;
  if(counter > itNbBeforeChange) {
    var minDistance = 3.5;
    for(var q = 0; q < treeslocations.length; q++) {
      if(firesStatesOfTrees[q]) {
        var distance = Math.sqrt(Math.pow(treeslocations[q].x - robotx[0], 2) + Math.pow(treeslocations[q].y - roboty[0], 2));
        minDistance = Math.min(minDistance, distance);
      }
    }
    var heatIncrement = (equilibriumDist - minDistance) / equilibriumDist;
    mercurelevelfloat = mercurelevelfloat + heatIncrement;
    if(mercurelevelfloat > 300) {
      mercurelevelfloat = 300;
    }
    if(mercurelevelfloat < 10) {
      mercurelevelfloat = 10;
    }
    mercurelevel = mercurelevelfloat.toString() + 'px';
    hotscreen = mercurelevelfloat/300;
    counter = 0;
  }
  counter++;
/*  if(tictac) {
    mercurelevel = '50px';
    tictac = false;
    hotscreen = 0;
  } else {
    mercurelevel = '300px';
    tictac = true;
    hotscreen = 1;
  }*/
});
serverGet.bind(PORTGET, HOST);
var counter = 0;

//=====================================================
// create udp message for orocos
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
  var udpMess = new Int8Array(100);
  for(var n = 0; n < 8; n++) {
    udpMess[n] = timestamp[n];
  }
  for(var o = 0; o < 50; o++) {
    udpMess[o + 8] = floatsBytes[o];
  }
  for(var p = 0; p < 50; p++) {
    udpMess[p + 58] = integersBytes[p];
  }
  return udpMess;
}

//=====================================================
// controls (MOVES ~ speedToUdpMess & WATER ~ exec)
//=====================================================
var sys = require('sys');
var exec = require('child_process').exec;
function puts(error, stdout) {
  sys.puts(stdout);
}
var firesStatesOfTrees = [false, false, false, false, false, false];
var numFightedFires = 0;
router.get('/fires', function(req, res) {
  res.json(firesStatesOfTrees);
});
router.get('/fightedfires', function(req, res) {
  res.json(numFightedFires);
});
var udpMess;
var buffer;
var client;
router.post('/', function(req, res/*, next*/) {
  console.log(req.body.key);
  if(req.body.key == 'front') {
    udpMess = speedToUdpMess(0.0, 0.6);
    buffer = new Buffer(udpMess);
    client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
      if(err) throw err;
      //console.log('UDP message sent to ' + HOST +':'+ PORT);
      client.close();
    });
  } else if(req.body.key == 'left') {
    udpMess = speedToUdpMess(0.3, 0.0);
    buffer = new Buffer(udpMess);
    client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
      if(err) throw err;
      //console.log('UDP message sent to ' + HOST +':'+ PORT);
      client.close();
    });
  } else if(req.body.key == 'right') {
    udpMess = speedToUdpMess(-0.3, 0.0);
    buffer = new Buffer(udpMess);
    client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
      if(err) throw err;
      //console.log('UDP message sent to ' + HOST +':'+ PORT);
      client.close();
    });
  } else if(req.body.key == 'back') {
    udpMess = speedToUdpMess(0.0, -0.6);
    buffer = new Buffer(udpMess);
    client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err) {
      if(err) throw err;
      //console.log('UDP message sent to ' + HOST +':'+ PORT);
      client.close();
    });
  } else if(req.body.key == 'space') {
    if(watlevel < 70) {
      watlevel = watlevel + 3;
    } else {
      robotTankEmpty = true;
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
      if((normDiff < 3) && (scalprod > 0.9) && firesStatesOfTrees[i]) {
        console.log('USEFULL');
        numFightedFires++;
        var indexTree = i + 1;
        var command1 = 'echo \'' + treeslocations[i].x.toString() + ' ' + treeslocations[i].y.toString() + ' -10\' | yarp write /data/out /morse/treeonfire' + indexTree.toString() + '/teleporttf' + indexTree.toString() + '/in';
        var command2 = 'echo \'' + treeslocations[i].x.toString() + ' ' + treeslocations[i].y.toString() + ' -0.1\' | yarp write /data/out /morse/tree' + indexTree.toString() + '/teleport' + indexTree.toString() + '/in';
        console.log(command1 + ' && ' + command2);
        exec(command1 + ' && ' + command2, puts);
        firesStatesOfTrees[i] = false;
      }
    }
  }
  res.json({
    posX: robotx,
    posY: roboty,
    orientation: roboto
  });
});

//=====================================================
// tree burning randomization
//=====================================================
var alea1 = -1;
var alea2 = -1;
var treenumber = -1;
var onfire = false;
var timerStart = 0;
setInterval(function() {
  // wait 15secs to be sure to send information to morse correctly
  if(timerStart < 14) {
    timerStart += 3;
  } else {
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
      console.log(command);
      exec(command, puts);
    }
    console.log('new fire ? ' + treenumber + ' ' + onfire);
  }
}, 3000);

//=====================================================
// robot tank
//=====================================================
// define fill/stopfill water functions
var fillWaterInterval;
var watlevel = 20;
var robotTankEmpty = false;
var isFillingWater = false;
var fillingWater = function() {
  isFillingWater = true;
  clearInterval(fillWaterInterval);
  fillWaterInterval = setInterval(function() {
    if(watlevel > 20) {
      watlevel = watlevel - 3;
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


//=====================================================
// water management part: 
//=====================================================
var openingcontrol = 0;
var faucetcontrol = 0;

var pivalue = 3.1415;

var xrobinet = 42;

var valveopening = 1;
var vlvop = 1;
var widthwaterflow = 10 - Math.abs(vlvop);

var coeffspeed = 25;
var coeffspeedopening = 0.1;

var faucetxaxis = 2 * 10 / 40;

setInterval(function() {
  if((xrobinet <= 80) && (xrobinet >= 0)) {
    xrobinet = xrobinet + coeffspeed * (pivalue / 80) * Math.sin(pivalue * xrobinet / 40 - pivalue) + faucetcontrol;
  } else if(xrobinet > 80) {
    xrobinet = 80;
  } else if(xrobinet < 0) {
    xrobinet = 0;
  }
  var fxa = (xrobinet - 40) * 10 / 40;
  faucetxaxis = fxa.toPrecision(3);
  if((vlvop <= 10) && (vlvop >= 0)) {
    vlvop = vlvop + coeffspeedopening * (pivalue / 10) * Math.sin(pivalue * vlvop / 5 - pivalue) + coeffspeedopening * openingcontrol;
  } else if(vlvop > 10) {
    vlvop = 10;
  } else if(vlvop < 0) {
    vlvop = 0;
  }
  var temp = (vlvop - 5) * 10 / 5;
    valveopening = temp.toPrecision(3);
    widthwaterflow = 10 - Math.abs(temp);
      //console.log($scope.widthwaterflow);
}, 200);

var watlevelContainer = 10;
setInterval(function() {
  if(watlevelContainer < 94) {
    watlevelContainer = watlevelContainer + 1;
  }
  if((faucetxaxis < 2) && (faucetxaxis > -2) && watlevelContainer > 0) {
    watlevelContainer = watlevelContainer - widthwaterflow / 3;
  }
}, 200);

// functions in/de/creasing control states of water management
var faucetctrlfctplus = function() {
  if(faucetcontrol < 3) {
    faucetcontrol = faucetcontrol + 1;
  }
};

var faucetctrlfctminus = function() {
  if(faucetcontrol > -3) {
    faucetcontrol = faucetcontrol - 1;
  }
};

var openingctrlfctplus = function() {
  if(openingcontrol < 3) {
    openingcontrol = openingcontrol + 1;
  }
};

var openingctrlfctminus = function() {
  if(openingcontrol > -3) {
    openingcontrol = openingcontrol - 1;
  }
};

// send new state of control of water management to client
router.post('/watercontrol', function(req, res/*, next*/) {
  console.log(req.body.key);
  if(req.body.button == 'plusT') {
    if(faucetcontrol < 3) {
      faucetcontrol = faucetcontrol + 1;
    }
  } else if(req.body.button == 'minusT') {
    if(faucetcontrol > -3) {
      faucetcontrol = faucetcontrol - 1;
    }
  } else if(req.body.button == 'plusV') {
    if(openingcontrol < 3) {
      openingcontrol = openingcontrol + 1;
    }
  } else if(req.body.button == 'minusV') {
    if(openingcontrol > -3) {
      openingcontrol = openingcontrol - 1;
    }
  } 
  res.json({
    tapControl: faucetcontrol,
    valveControl: openingcontrol
  });
});

// give tap position, valve opening and water level of the container to client
router.get('/watermanagement', function(req, res) {
  res.json([xrobinet,vlvop,watlevelContainer]);
});


//=====================================================
// remaining time part
//=====================================================
var remainingtime = 600;
setInterval(function() {
  if(remainingtime > 0) {
    remainingtime = remainingtime - 1;
  }
}, 1000);
// give remaining time to client
router.get('/time', function(req, res) {
  res.json(remainingtime);
});

//=====================================================
// battery part 
// TODO: discharging rate higher when moving/using water
//=====================================================
var batteryLevel = 24;
setInterval(function() {
  if(batteryLevel > 0) {
    batteryLevel = batteryLevel - 0.1;
  }
}, 1000);
// give battery level to client
router.get('/battery', function(req, res) {
  res.json(batteryLevel);
});

var fillBatteryInterval;
var batteryEmpty = false;
var isFillingBattery = false;
var fillingBattery = function() {
  isFillingBattery = true;
  clearInterval(fillBatteryInterval);
  fillBatteryInterval = setInterval(function() {
    if(batteryLevel < 24) {
      batteryLevel = batteryLevel + 0.5;
    }
  }, 500);
};
var stopFillingBattery = function() {
  clearInterval(fillBatteryInterval);
  isFillingBattery = false;
};


//=====================================================
// heat simulation part 
//=====================================================

// TODO go server side
var tictac = false;
var hotscreen = 0;
var mercurelevel = '10px';
var mercurelevelfloat = 10;
/*
setInterval(function() {
  if(tictac) {
    mercurelevel = '50px';
    tictac = false;
    hotscreen = 0;
  } else {
    mercurelevel = '300px';
    tictac = true;
    hotscreen = 1;
  }
}, 1000);
*/
// give temp/screen effect to client
router.get('/temperature', function(req, res) {
  res.json([mercurelevel,hotscreen]);
});

module.exports = router;
