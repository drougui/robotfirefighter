'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './auth.events';

var AuthSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

registerEvents(AuthSchema);
export default mongoose.model('Auth', AuthSchema);
