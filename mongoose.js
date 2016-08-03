'use strict';

let mongoose = require('mongoose');
let config = require('./config');
let options = {
      user: config.db.user,
      pass: config.db.password
    };
let host = config.db.host;
let port = config.db.port;
let db = config.db.name;

mongoose.Promise = global.Promise;

mongoose.connect(`mongodb://${host}:${port}/${db}`, options)
  .catch(e => {
    console.error(e);
    throw e;
  });

module.exports = mongoose;