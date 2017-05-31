/**
 * Auth model events
 */

'use strict';

import {EventEmitter} from 'events';
var AuthEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
AuthEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Auth) {
  for(var e in events) {
    let event = events[e];
    Auth.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    AuthEvents.emit(event + ':' + doc._id, doc);
    AuthEvents.emit(event, doc);
  };
}

export {registerEvents};
export default AuthEvents;
