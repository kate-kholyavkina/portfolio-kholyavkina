'use strict';

let route = require('express').Router();
let mongoose = require('mongoose');
let crypto = require('crypto');

route.post('/', (req, res) => {
  if (!req.body.login || !req.body.password) {
    return res.json({ error: 'Укажите логин и пароль!' });
  }

  let Model = mongoose.model('user'),
      password = crypto.createHash('md5')
        .update(req.body.password)
        .digest('hex');

  Model.findOne({
    login: req.body.login,
    password: password
  }).then(item => {
    if (!item) {
      res.json({ error: 'Логин и/или пароль введены неверно! '})
    }
    else {
      res.session.isAdmin = true;
      res.json({});
    }
  });

});

module.exports = route;