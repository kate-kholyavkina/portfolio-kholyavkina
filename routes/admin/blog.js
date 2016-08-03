'use strict';

let route = require('express').Router();
let mongoose = require('mongoose');

// сохранение в базу 
route.post('/blog', (req,res) => {
  
  // обработка тела запроса и приведение его к формату, который можно созранить в базе
  let Model = mongoose.model('blog'),
      item = new Model({
        title: req.body.itemName,
        date: req.body.itemDate,
        body: req.body.itemBody
      });

  item.save().then(
    i => res.json({ message: 'Запись успешно добавлена!' })
  );e => {
    let error = Object.keys(e.errors)
      .map(key => e.errors[key].message)
      .join(', ');
    res.json({ error: error })
  }
  
});

module.exports = route;