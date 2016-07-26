'use strict';

let route = require('express').Router();
let mongoose = require('mongoose');
let skills = require('../models/skills.json');

        let fs = require('fs');


        const YOUR_LOCALS = './content.json';
        const CONTENT = JSON.parse(fs.readFileSync(YOUR_LOCALS, 'utf-8'));

route.get('/', (req,res) => {
        res.render('index', {content: CONTENT});
});

route.get('/blog.html', (req,res) => {
  let Model = mongoose.model('blog');

  console.log(Model);

  Model.find().then(items => {
    res.render('pages/blog', {content: CONTENT, items: items});
  });
});

route.get('/works.html', (req,res) => {
  let Model = mongoose.model('work');

  Model.find().then(items => {
    res.render('pages/works', {content: CONTENT, items: items});
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

    res.render('pages/about', {content: CONTENT, skills: skills, form: form});
  });
});

module.exports = route;