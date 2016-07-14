'use strict';

let route = require('express').Router();
let mongoose = require('mongoose');
let skills = require('../models/skills.json');

route.get('/', (req,res) => {
  res.render('auth');
});

route.get('/blog.html', (req,res) => {
  let Model = mongoose.model('blog');

  Model.find().then(items => {
    res.render('blog', {items: items});
  });
});

route.get('/works.html', (req,res) => {
  let Model = mongoose.model('work');

  Model.find().then(items => {
    res.render('works', {items: items});
  });
});

route.get('/about.html', (req,res) => {
  let Model = mongoose.model('skills');

  Model.find().then(items => {
    let form = items.reduce((prev, cur) => {
      prev[cur.section] = cur.items.reduce((prev, cur) => {
        prev[cur.name] = cur.value;

        return prev;
      }, {});

      return prev;
    }, {});

    res.render('about', {skills: skills, form: form});
  });
});

module.exports = route;