'use strict';

let mongoose = require('mongoose');
let mongoosejs = require('./mongoose.js');
let readline = require('readline');
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

mongoose.Promise = global.Promise;

let login = '';
let password = '';

rl.question('Логин: ', answer => {
  login = answer;

  rl.question('Пароль: ', answer => {
    password = answer;
    rl.close();
  });
});

rl.on('close', () => {
  require('./models/user');

  let User = mongoose.model('user'),
      adminUser = new User({ login: login, password: password });

  User.findOne({ login: login }).then(u => {
    if (u) {
      throw new Error('Такой пользователь уже существует!');
    }

    return adminUser.save();
  }).then(
    u => console.log('ok!'),
    e => console.error(e.message)
  ).then(() => process.exit(0));

});
