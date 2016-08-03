module.exports = (req, res, next) => {
  console.log('middleware.js req.session:', req.session);
  console.log('middleware.js req.session.isAdmin:', req.session.isAdmin);
  if (!req.session.isAdmin) {
    res.redirect('/');
  } else {
    next();
  }
};