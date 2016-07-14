'use strict';

let route = require('express').Router();
let nodemailer = require('nodemailer');
let config = require('../config.json');

route.post('/', (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.text) {
    return res.json({ error: 'Укажите данные!' });
  }

  let transporter = nodemailer.createTransport(config.mail.smtp)
  let mailOptions = {
    from: `"${req.body.name}" <${req.body.email}>`,
    to: config.mail.smtp.auth.user,
    subject: config.mail.subject,
    text: req.body.text.trim().slice(0, 500)
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          return res.json({ error: error.message });
      }

      res.json({});
  });

});

module.exports = route;