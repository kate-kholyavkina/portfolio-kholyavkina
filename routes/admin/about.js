'use strict';

let route = require('express').Router();
let mongoose = require('mongoose');
let skills = require('../../models/skills.json');

require('../../models/skills');

// routes: корень раздела admin
route.get('/', (req, res) => {
  let Model = mongoose.model('skills');

  // ищем в базе скилы и выводим их на страницу админки
  Model.find().then(items => {
    let form = items.reduce((prev, cur) => {
      prev[cur.section] = cur.items.reduce((prev, cur) => {
        prev[cur.name] = cur.value;
        return prev;
      }, {});

      return prev;
    }, {});

    res.render('admin', { skills: skills, form: form });
  });
});


// сохранение в базу 
route.post('/about', (req,res) => {

  // обработка тела запроса и приведение его к формату, который можно созранить в базе
  let Model = mongoose.model('skills');
  let models = [];

  Object.keys(req.body).map(section => ({
    section: section,
    items: Object.keys(req.body[section]).map(i => ({
      name: i,
      value: req.body[section][i]
    }))
  })).forEach(toSave => models.push(new Model(toSave)));

  // валидация (нужны числа)
  if (models.filter(m => m.validateSync()).length) {
    return res.json({ error: 'Не удалось сохранить данные!' })ж
  }

  // удаление старых навыков из базы и запись новых
  Model.remove({}).then(() => {
    Model.insertMany(models).then(() => 
      res.json({ message: 'Сохранено!' })
    );
  });

});

module.exports = route;