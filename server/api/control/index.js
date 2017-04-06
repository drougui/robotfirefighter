'use strict';
//import path from 'path';
//import config from '../../config/environment';
var express = require('express');
//var app = require('../../app.js');
var router = express.Router();

var PORT = 9000;
var PORTGET = 9010;
var HOST = 'localhost';
var dgram = require('dgram');

var serverGet = dgram.createSocket('udp4');
serverGet.on('listening', function () {
    var address = serverGet.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

var robotx = 0.0;
var roboty = 0.0;
serverGet.on('message', function (message, remote) {
    var byteArray = new Int8Array(4);
    for (var i = 0; i < 4; i++) {
      byteArray[i] = message[8+6*4 + i];
    }
    var posY = new Float32Array(byteArray.buffer);
    var byteArray2 = new Int8Array(4);
    for (var i = 0; i < 4; i++) {
      byteArray2[i] = message[8+7*4 + i];
    }
    var posX = new Float32Array(byteArray2.buffer);

    console.log(remote.address + ':' + remote.port +' - ' + posX + '  ' + posY);
    robotx = posX;
    roboty = posY;
});
serverGet.bind(PORTGET, HOST);

var sys = require('sys')
var exec = require('child_process').exec;
var tictac = true;
var alea1 = -1;
var alea2 = -1;
var treenumber = -1;
var onfire = false;

function speedToUdpMess(as, ls) {
  var NB_INTS = 50;
  var NB_FLOATS = 50;
  var LGTH_BYTES = 8 + NB_FLOATS * 4 + NB_INTS * 2;
  var timestamp = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];

  var speed = new Float32Array(2);
  speed[0] = as;
  speed[1] = ls;
  
  var floats = new Float32Array(NB_FLOATS);
  floats[0] = speed[0];
  floats[1] = speed[1];
  for (var i = 2; i < NB_FLOATS; i++) {
    floats[i]=0.0;
  }
  var floatsBytes = new Int8Array(floats.buffer); 
  
  var integers = new Int16Array(50);
  for (var i = 0; i < NB_INTS; i++) {
    integers[i] = 0;
  }
  var integersBytes = new Int8Array(integers.buffer);  
   
  var udpMess = new Int8Array(100);
  for (var i = 0; i < 8; i++) {
    udpMess[i]=timestamp[i];
  }
  for (var i = 0; i < 50; i++) {
    udpMess[i+8]=floatsBytes[i];
  }
  for (var i = 0; i < 50; i++) {
    udpMess[i+58]=integersBytes[i];
  }
  return udpMess;
}


function puts(error, stdout, stderr) { sys.puts(stdout) }
var firesStatesOfTrees = [false, false, false, false, false, false];

router.post('/', function(req, res/*, next*/) {
  console.log(req.body.key);
  //TRAITEMENT
  //res.status(200).json({});
  //res.status(400);
  if (req.body.key=='front') {
    var udpMess = speedToUdpMess(0.0,0.6);
    var buffer = new Buffer(udpMess);
    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
      if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT);
        client.close();
    });
  } else if (req.body.key=='left') {
    var udpMess = speedToUdpMess(0.3,0.0);
    var buffer = new Buffer(udpMess);
    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
      if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT);
        client.close();
    });
  } else if (req.body.key=='right') {
    var udpMess = speedToUdpMess(-0.3,0.0);
    var buffer = new Buffer(udpMess);
    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
      if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT);
        client.close();
    });
  } else if (req.body.key=='back') {
    var udpMess = speedToUdpMess(0.0,-0.6);
    var buffer = new Buffer(udpMess);
    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
      if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT);
        client.close();
    });
  } else if (req.body.key=='space') {
    if ( (Math.pow(robotx[0] - 4.55076,2) + Math.pow(roboty[0] - 14.66826,2)) < 9 ){
        exec("echo '4.55076 14.66826 -10' | yarp write /data/out /morse/treeonfire/teleportf/in && echo '4.55076 14.66826 -0.1' | yarp write /data/out /morse/tree/teleport/in", puts);
        firesStatesOfTrees[0] = false;
    } else if ( (Math.pow(robotx[0] + 0.7353,2) + Math.pow(roboty[0] - 14.75052,2)) < 9 ){
        exec("echo '-0.7353 14.75052 -0.1' | yarp write /data/out /morse/tree2/teleport2/in && echo '-0.7353 14.75052 10' | yarp write /data/out /morse/treeonfire2/teleportf2/in", puts);
        firesStatesOfTrees[1] = false;
    } else if ( (Math.pow(robotx[0] + 15.10146,2) + Math.pow(roboty[0] - 15.76476,2)) < 9 ){
        exec("echo '-15.10146 15.76476 -0.1' | yarp write /data/out /morse/tree3/teleport3/in && echo '-15.10146 15.76476 -10' | yarp write /data/out /morse/treeonfire3/teleportf3/in", puts);
        firesStatesOfTrees[2] = false;
    } else if ( (Math.pow(robotx[0] + 2.6019,2) + Math.pow(roboty[0] - 6.7425,2)) < 9 ){
        exec("echo '-2.6019 6.7425 -0.1' | yarp write /data/out /morse/tree4/teleport4/in && echo '-2.6019 6.7425 -10' | yarp write /data/out /morse/treeonfire4/teleportf4/in", puts);
        firesStatesOfTrees[3] = false;
    } else if ( (Math.pow(robotx[0] + 1.33158,2) + Math.pow(roboty[0] - 7.02042,2)) < 9 ){
        exec("echo '-1.33158 7.02042 -0.1' | yarp write /data/out /morse/tree5/teleport5/in && echo '-1.33158 7.02042 -10' | yarp write /data/out /morse/treeonfire5/teleportf5/in", puts);
        firesStatesOfTrees[4] = false;
    } else if ( (Math.pow(robotx[0] - 16.58292,2) + Math.pow(roboty[0] + 12.5847,2)) < 9 ){
        exec("echo '16.58292 -12.5847 -0.1' | yarp write /data/out /morse/tree6/teleport6/in && echo '16.58292 -12.5847 -10' | yarp write /data/out /morse/treeonfire6/teleportf6/in", puts);
        firesStatesOfTrees[5] = false;
    }




 /*else if ( (Math.pow(robotx[0] - 16.58292,2) + Math.pow(roboty[0] + 12.5847,2)) < 9 ){
        exec("echo '16.58292 -12.5847 -0.1' | yarp write /data/out /morse/tree6/teleport6/in && echo '16.58292 -12.5847 -10' | yarp write /data/out /morse/treeonfire6/teleportf6/in",
        firesStatesOfTrees[5] = false;
    }*/

/*

exec("echo '-2.6019 6.7425 -10' | yarp write /data/out /morse/tree4/teleport4/in && echo '-2.6019 6.7425 -0.1' | yarp write /data/out /morse/treeonfire4/teleportf4/in", puts);
                firesStatesOfTrees[3] = true;
            } else if ((treenumber == 4) && !firesStatesOfTrees[4]){
                exec("echo '-1.33158 7.02042 -10' | yarp write /data/out /morse/tree5/teleport5/in && echo '-1.33158 7.02042 -0.1' | yarp write /data/out /morse/treeonfire5/teleportf5/in", puts);
                firesStatesOfTrees[4] = true;
            } else if ((treenumber == 5) && !firesStatesOfTrees[5]){
                exec("echo '16.58292 -12.5847 -10' | yarp write /data/out /morse/tree6/teleport6/in && echo '16.58292 -12.5847 -0.1' | yarp write /data/out /morse/treeonfire6/teleportf6/in", puts);
                firesStatesOfTrees[5] = true;


*/

/*  1.1 0.2 1.8 */
    /*var udpMess = speedToUdpMess(0.0,-0.6);
    var buffer = new Buffer(udpMess);
    var client = dgram.createSocket('udp4');
    client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
      if (err) throw err;
        console.log('UDP message sent to ' + HOST +':'+ PORT);
        client.close();
    });*/
  } 

  res.json({
    posX: robotx,
    posY: roboty
  });
});
    
    setInterval(function(){
        alea1 = Math.random();
        alea2 = Math.random();
        console.log("alea " + alea1 )
        if ( (0<=alea1) && (alea1<0.1) ){
            treenumber = 0;
        } else if ((0.1<=alea1) && (alea1<0.2)){
            treenumber = 1;
        } else if ((0.2<=alea1) && (alea1<0.3)){
            treenumber = 2;
        } else if ((0.3<=alea1) && (alea1<0.4)){
            treenumber = 3;
        } else if ((0.4<=alea1) && (alea1<0.5)){
            treenumber = 4;
        } else if ((0.5<=alea1) && (alea1<0.6)){
            treenumber = 5;
        } else {
            treenumber = -1;
        }

        if (alea2<0.33333){
            onfire = true;
        }

        if (onfire && (treenumber!=-1) ){
            if ( (treenumber == 0) && !firesStatesOfTrees[0]){
                exec("echo '4.55076 14.66826 -10' | yarp write /data/out /morse/tree/teleport/in && echo '4.55076 14.66826 -0.1' | yarp write /data/out /morse/treeonfire/teleportf/in", puts);
		firesStatesOfTrees[0] = true;
            } else if ( (treenumber == 1) && !firesStatesOfTrees[1]){
                exec("echo '-0.7353 14.75052 -10' | yarp write /data/out /morse/tree2/teleport2/in && echo '-0.7353 14.75052 -0.1' | yarp write /data/out /morse/treeonfire2/teleportf2/in", puts);
		firesStatesOfTrees[1] = true;
            } else if ( (treenumber == 2) && !firesStatesOfTrees[2]){
                exec("echo '-15.10146 15.76476 -10' | yarp write /data/out /morse/tree3/teleport3/in && echo '-15.10146 15.76476 -0.1' | yarp write /data/out /morse/treeonfire3/teleportf3/in", puts);
		firesStatesOfTrees[2] = true;
            } else if ( (treenumber == 3) && !firesStatesOfTrees[3]){
                exec("echo '-2.6019 6.7425 -10' | yarp write /data/out /morse/tree4/teleport4/in && echo '-2.6019 6.7425 -0.1' | yarp write /data/out /morse/treeonfire4/teleportf4/in", puts);
                firesStatesOfTrees[3] = true;
            } else if ((treenumber == 4) && !firesStatesOfTrees[4]){
                exec("echo '-1.33158 7.02042 -10' | yarp write /data/out /morse/tree5/teleport5/in && echo '-1.33158 7.02042 -0.1' | yarp write /data/out /morse/treeonfire5/teleportf5/in", puts);
                firesStatesOfTrees[4] = true;
            } else if ((treenumber == 5) && !firesStatesOfTrees[5]){
                exec("echo '16.58292 -12.5847 -10' | yarp write /data/out /morse/tree6/teleport6/in && echo '16.58292 -12.5847 -0.1' | yarp write /data/out /morse/treeonfire6/teleportf6/in", puts);
                firesStatesOfTrees[5] = true;
            }
        }

/*
treeonfire2.translate(x=-0.7353,y=14.75052,z=-10)

treeonfire3.translate(x=-15.10146,y=15.76476,z=-10)

treeonfire4.translate(x=-2.6019,y=6.7425,z=-10)

treeonfire5.translate(x=-1.33158,y=7.02042,z=-10)

treeonfire6.translate(x=16.58292,y=-12.5847,z=-10)
*/





        console.log("Hello" + treenumber + " " + onfire);
    },3000);

module.exports = router;

