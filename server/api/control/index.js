'use strict';
var express = require('express');
var router = express.Router();

//=====================================================
// define trees locations using treeslocs.json
//=====================================================
var fs = require('fs');
var chaine = fs.readFileSync("/home/drougard/driving-human-robots-interaction/treeslocs.json", "UTF-8");
var treeslocations = JSON.parse(chaine);
console.log("TREES LOCATIONS");
console.log(treeslocations[0].x);
router.get('/', function(req,res){
    res.json(chaine);
})

//=====================================================
// get position/orientation
//=====================================================
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
var roboto = 0.0;
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

    var byteArray3 = new Int8Array(4);
    for (var i = 0; i < 4; i++) {
      byteArray3[i] = message[8+8*4 + i];
    }
    var orientation = new Float32Array(byteArray3.buffer);
    //console.log(remote.address + ':' + remote.port +' - ' + posX + '  ' + posY + '  ' + orientation);
    robotx = posX;
    roboty = posY;
    roboto = orientation;
});
serverGet.bind(PORTGET, HOST);

//=====================================================
// create udp message for orocos
//=====================================================
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

//=====================================================
// controls (MOVES ~ speedToUdpMess & WATER ~ exec)
//=====================================================
var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
var firesStatesOfTrees = [false, false, false, false, false, false];
var numFightedFires = 0;
router.post('/', function(req, res/*, next*/) {
    console.log(req.body.key);
    if (req.body.key=='front') {
        var udpMess = speedToUdpMess(0.0,0.6);
        var buffer = new Buffer(udpMess);
        var client = dgram.createSocket('udp4');
        client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
        });
    } else if (req.body.key=='left') {
        var udpMess = speedToUdpMess(0.3,0.0);
        var buffer = new Buffer(udpMess);
        var client = dgram.createSocket('udp4');
        client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
        });
    } else if (req.body.key=='right') {
        var udpMess = speedToUdpMess(-0.3,0.0);
        var buffer = new Buffer(udpMess);
        var client = dgram.createSocket('udp4');
        client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
          if (err) throw err;
          //console.log('UDP message sent to ' + HOST +':'+ PORT);
          client.close();
        });
    } else if (req.body.key=='back') {
        var udpMess = speedToUdpMess(0.0,-0.6);
        var buffer = new Buffer(udpMess);
        var client = dgram.createSocket('udp4');
        client.send(buffer, 0, buffer.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            //console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
        });
    } else if (req.body.key=='space') {
        for (var i=0;i<treeslocations.length;i++){
            // close enough + good orientation
            var diffX = treeslocations[i].x - robotx[0];
            var diffY = treeslocations[i].y - roboty[0];
            var diffO = 0.0;
            var normDiff = Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2))
            diffX = diffX/normDiff;
            diffY = diffY/normDiff;
            var robotoX = Math.cos(roboto);
            var robotoY = Math.sin(roboto);
            var scalprod = robotoX * diffX + robotoY * diffY;
            if ( (normDiff < 3) && (scalprod>0.9) && firesStatesOfTrees[i] ){
                console.log("USEFULL")
                numFightedFires++;
                // send the number of extincted fires
                router.get('/fightedfires', function(req,res){
                    res.json(numFightedFires);
                })
                var indexTree = i + 1;
                var command1 = "echo '" + treeslocations[i].x.toString() + ' ' + treeslocations[i].y.toString() + " -10' | yarp write /data/out /morse/treeonfire" + indexTree.toString() + "/teleporttf" + indexTree.toString() + "/in";
                var command2 = "echo '" + treeslocations[i].x.toString() + ' ' + treeslocations[i].y.toString() + " -0.1' | yarp write /data/out /morse/tree" + indexTree.toString() + "/teleport" + indexTree.toString() + "/in";
                console.log(command1 + " && " + command2);
                exec(command1 + " && " + command2, puts);
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
setInterval(function(){
    // wait 15secs to be sure to send information to morse correctly
    if (timerStart<14){
        timerStart += 3;
    }
    else{
        alea1 = Math.random();
        alea2 = Math.random();
	treenumber = Math.floor(alea1*treeslocations.length);
	onfire = false;
        if (alea2<0.33333){
            onfire = true;
        }
        if (onfire && (treenumber!=-1) && !firesStatesOfTrees[treenumber]){
            firesStatesOfTrees[treenumber] = true;
            // update states of fires to show them on the map
            router.get('/fires', function(req,res){
                res.json(firesStatesOfTrees);
            })
            var indexTree = treenumber +1; 
            var command1 = "echo '" + treeslocations[treenumber].x.toString() + ' ' + treeslocations[treenumber].y.toString() + " -0.1' | yarp write /data/out /morse/treeonfire" + indexTree.toString() + "/teleporttf" + indexTree.toString() + "/in";
            var command2 = "echo '" + treeslocations[treenumber].x.toString() + ' ' + treeslocations[treenumber].y.toString() + " -10' | yarp write /data/out /morse/tree" + indexTree.toString() + "/teleport" + indexTree.toString() + "/in";
            var command = command2 + " && " + command1 
            console.log(command);
            exec(command, puts);
        }
        console.log("new fire ? " + treenumber + " " + onfire);
    }
},3000);

//=====================================================
// water management part
//=====================================================

// TODO
module.exports = router;
