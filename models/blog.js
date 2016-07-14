'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BlogSchema = new Schema({
      title: {
        type: String,
        required: [true, 'Укажите заголовок статьи']
      },
      body: {
        type: String,
        required: [true, 'Укажите содержимое статьи']
      },
      date: {
        type: String,
        required: [true, 'Укажите дату публикации']
      }
    });


mongoose.model('blog', BlogSchema);