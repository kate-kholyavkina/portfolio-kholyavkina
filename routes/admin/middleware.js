module.exports = (req, res, next) => {
  console.log('middleware.js req.session.isAdmin:', req.session.isAdmin);
  if (!req.session.isAdmin) {
    console.log('middleware.js redirect');
    res.redirect('/');
  } else {
    console.log('middleware.js next()');
    next();
  }
};