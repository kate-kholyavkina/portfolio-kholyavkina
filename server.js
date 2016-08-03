'use strict';

let fs = require('fs');
let path = require('path');
let express = require('express');
let jade = require('jade');
let config = require('./config.json');
let mongoose = require('./mongoose');
let bodyParser = require('body-parser');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let app = express();

let blog = require('./models/blog');
let skills = require('./models/skills');
let work = require('./models/work');
let user = require('./models/user');

// let content = require('./content');
let content = require('./content.json');

mongoose.Promise = global.Promise;

app.use(session({
  secret: 'kate',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.set('view engine', 'jade');
app.set('views', path.resolve(`./${config.http.publicRoot}/markups/_pages`));

app.use(express.static(path.resolve(config.http.publicRoot)));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//=== routes ===

app.use('/admin', require('./routes/admin/middleware'));
app.use('/admin', require('./routes/admin/about'));
app.use('/admin', require('./routes/admin/blog'));
app.use('/admin', require('./routes/admin/works'));
// app.use('/blog.html', require('./routes/front'));
app.use('/', require('./routes/front'));
app.use('/mail', require('./routes/mail'));
app.use('/auth', require('./routes/auth'));

//==== 404 =====
app.use((req,res,next) => res.status(404).send('Page not found!'));


//=== errors ===
// блок ошибок должен быть в конце всех блоков use и иметь 4 параметра
app.use((err,req,res,next) => {
  res.status(500);
  res.render('error', {error: err.message});
  console.log(err.message, err.stack);
});

//=== server ===
app.listen(config.http.port, config.http.host, () => {
  let uploadDir = path.resolve(config.http.publicRoot + '/upload');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  console.log(`Server is up on ${config.http.host}: ${config.http.port}!`);
});
