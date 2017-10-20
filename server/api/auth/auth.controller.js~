/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/auth              ->  index
 * POST    /api/auth              ->  create
 * GET     /api/auth/:id          ->  show
 * PUT     /api/auth/:id          ->  upsert
 * PATCH   /api/auth/:id          ->  patch
 * DELETE  /api/auth/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Auth from './auth.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// ========================
// ========================
//    ROBOT FIREFIGHTER
// ========================
// ========================

// =============================================
//  JSON Web Tokens, or JWTs (pronounced jots)
// =============================================
var jwt = require('jwt-simple');
// to manage token expiration
var moment = require('moment');
// TODO 
// GIVE THIS IN ARGUMENT WHEN LAUNCHING THE INTERNET SITE 
// ??? app.set('jwtTokenSecret', 'YOUR_SECRET_STRING'); ???
var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex');
// INITIATIZATION
// someone playing ?
var emptySlot = true; // nobody is playing
global.expires = moment().add('minutes', 11).valueOf(); // payload = [authorization, expiration]
var payload = {auth: true,
               exp: expires};

// ===========================================
//   GET LOADING STATE (loaded/loading)
//   AND SEND IT TO CLIENT (loading page)
// ===========================================
var sys = require('sys');
var exec = require('child_process').exec;
global.isgameready = false; // state of loading
global.istoolate = false;
var net = require('net');
var clickOnLetsPlayTimeout; // a timeout is defined when everything is loaded
// listen to the end of MORSE & co's loading
var server = net.createServer(function(socket) {
  socket.write('Echo server\r\n');
  console.log('Auth -- TCP SERVER: GAME LOADED');
  socket.on('data', function(data){
    var textChunk = data.toString('utf8');
    console.log('message:');
    console.log(textChunk);
  });
  global.isgameready = true;
  clickOnLetsPlayTimeout = setTimeout(function() { // the player has 30secs to click on letsplay
    exec('bash ~/driving-human-robots-interaction/killAll.sh');
    setTimeout(function() {
      console.log('Auth -- TIMEOUT on LETSPLAY -> emptySlot=true');
      emptySlot = true;
      global.expires = moment().add('minutes', 11).valueOf();
      payload = {auth: true,
                 exp: global.expires};
      global.token = jwt.encode(payload, secret);
      console.log('Auth -- New token:');
      console.log(global.token);
      console.log('Auth -- Kill game.');
      exec('bash ~/driving-human-robots-interaction/killAll.sh');
    },2000);
      global.istoolate = true; // TO SAY IT IS DEAD
      global.isgameready = false;
      console.log("global.istoolate");
      console.log(global.istoolate);
  }, 30000);
});
server.listen(50002, 'localhost');

// send loading information to client
export function gameReady(req, res) {
   if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    console.log("decoded.auth:");
    console.log(decoded.auth);    
    if(decoded.auth && decoded.exp === global.expires){
      res.json({isgameready: global.isgameready, 
                istoolate: global.istoolate});
      global.isgameready = false;
      global.istoolate = false;
      console.log('Auth -- send loading information to client');
    }
  }
}
var mycounter = 1;
var mycounter2 = 1;
// function meant to clear previous timeout
// called by letsplay in 'loading' component 



// bug = res.status zapé
export function killTimeout(req,res) {
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      console.log("==========================================");
      console.log(" FIRST COUNTER TIMEOUT: " + mycounter);
      console.log("==========================================");
      console.log('Auth -- Clear timeout.');
      clearTimeout(clickOnLetsPlayTimeout);
      console.log('Auth -- Isplaying timeout creation.');
      global.isPlayingTimeout = setTimeout(function() { // the player has 30secs to click on a button or press a control key
          exec('bash ~/driving-human-robots-interaction/killAll.sh');
          global.stopGame();
          console.log("==========================================");
          console.log(" SECOND COUNTER TIMEOUT: " + mycounter2);
          console.log("==========================================");
          console.log('Auth -- FIRST TIMEOUT on isplaying -> emptySlot=true');
          emptySlot = true;
          global.expires = moment().add('minutes', 11).valueOf();
          payload = {auth: true,
                     exp: global.expires};
          global.token = jwt.encode(payload, secret);
          console.log('Auth -- FIRST New token:');
          console.log(global.token);
          console.log('Auth -- FIRST Kill game.');
        }, 30000);
        res.status(200).json('Auth -- clickOnLetsPlayTimeout cleared, isPlayingTimeout defined');
     } else{
      res.status(401).json('Auth -- Invalid token.');
    }
  } else{
    res.status(401).json('Auth -- No token.');
  }
}

// TODO: changer la valeur de emptySlot selon l'activité du mec (fin du jeu/30sec sans rien toucher => killall + emptySlot = true
export function newtoken(req,res) {
  console.log('Auth -- New token function:');
  console.log(req.body)
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      console.log(decoded);
      emptySlot=true;
      console.log('Auth -- emptySlot:');
      console.log(emptySlot);
      global.expires = moment().add('minutes', 11).valueOf();
      payload = {auth: true,
                 exp: global.expires};
      global.token = jwt.encode(payload, secret);
      clearTimeout(global.isPlayingTimeout);
      res.status(200).json('Auth -- Slot is now empty, a new token is created (given to nobody).');
    } else{
      res.status(401).json('Auth -- Wrong token.');
    }
  } else{
    res.status(401).json('Auth -- No token.');
  }
}


// Gets a list of Auths
export function status(req, res) {
 res.status(200).json(emptySlot);
}

// BEGIN A PLAY SESSION
export function play(req, res) {
  if(emptySlot){
    global.istoolate = false;
    global.expires = moment().add('minutes', 11).valueOf(); // payload = [authorization, expiration]
    payload = { auth: true,
                exp: global.expires };
    global.token = jwt.encode(payload, secret);
    res.status(200).json(global.token);
    emptySlot = false;
    console.log("Auth -- new token given:");
    console.log(global.token);
  }
  else{
    res.status(401).json('Auth -- Slot is not empty.');
  }
}

// check expiration of tokens every 3secs
var checkExpiration = setInterval(function() {
  if( global.expires <= Date.now() ) {
    emptySlot = true;
    console.log("Auth -- expiration of current token, creation of a new one. ");
    global.expires = moment().add('minutes', 11).valueOf();
    payload = { auth: true,
              exp: global.expires };
    global.token = jwt.encode(payload, secret);
    console.log('Auth -- kill game.');
    // reinit js part of the game
    global.stopGame();
//    exec('bash ~/driving-human-robots-interaction/killAll.sh');

  }
}, 3000);

global.isPlayingTimeout;
export function isplaying(req,res) {
  console.log('Auth -- isplaying function:');
  console.log(req.body);
  if(req.body.token) {
    var decoded = jwt.decode(req.body.token, secret);
    if(decoded.auth && decoded.exp === global.expires){
      if(req.body.isplaying){
        mycounter = mycounter + 1;
        console.log("======================================");
        console.log(" FIRST COUNTER TIMEOUT: " + mycounter);
        console.log("======================================");
        console.log('Auth -- Clear isplaying timeout.');
        clearTimeout(global.isPlayingTimeout);
        mycounter2 = mycounter2 + 1;
        console.log('Auth -- Create a new one.');
        global.isPlayingTimeout = setTimeout(function() { // the player has 30secs to click on a button or press an control key
          console.log("==========================================");
          console.log(" SECOND COUNTER TIMEOUT: " + mycounter2);
          console.log("==========================================");
          console.log('Auth -- TIMEOUT on isplaying -> emptySlot=true');
          emptySlot = true;
          global.expires = moment().add('minutes', 11).valueOf();
          payload = {auth: true,
                     exp: global.expires};
          global.token = jwt.encode(payload, secret);
          console.log('Auth -- New token:');
          console.log(global.token);
          console.log('Auth -- Kill game.');
          global.stopGame();
          exec('bash ~/driving-human-robots-interaction/killAll.sh');
        }, 30000);
      } else{
        console.log("not playing!");
      }
      res.status(200).json('Auth -- isplaying received.');
    } else{
      res.status(401).json('Auth -- Wrong token.');
    }
  } else{
    res.status(401).json('Auth -- No token.');
  }
}


global.newtoken = function() {
  console.log('New token function:');
  emptySlot=true;
  console.log('emptySlot:');
  console.log(emptySlot);
  global.expires = moment().add('minutes', 11).valueOf();
  payload = {auth: true,
             exp: global.expires};
  global.token = jwt.encode(payload, secret);
  clearTimeout(global.isPlayingTimeout);
}

