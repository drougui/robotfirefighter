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
var emptySlot=true;
var jwt = require('jwt-simple');
var payload = {auth:true};
var secret = Buffer.from('fe1a1915a379f3be5394b64d14794932', 'hex')

// Gets a list of Auths
export function status(req, res) {
 res.status(200).json(emptySlot)
}
export function play(req, res) {
	if(emptySlot){
		global.token = jwt.encode(payload, secret);
		 res.status(200).json(global.token)
		emptySlot=false;
	}
	else{
		 res.status(403).json("NOK")
	}

}

var sys = require('sys');
var exec = require('child_process').exec;
export function killall(req, res) {
  exec('bash ~/driving-human-robots-interaction/killAll.sh');
  res.status(200).json("everything killed")
}

export function start(req, res) {
  exec('bash ~/driving-human-robots-interaction/restart.sh');
  res.status(200).json("restart")
}
