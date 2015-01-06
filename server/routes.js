/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.get('/signup', function(req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  app.use('/api/login', require('./api/login'));
  app.use('/api/users', require('./api/user'));
  app.use(function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();

    res.redirect('/login');
  });

// Insert routes below

  app.use('/api/deploys', require('./api/deploy'));

  app.use('/api/cancelbuilds', require('./api/cancelbuild'));
  app.use('/api/tests', require('./api/test'));
  app.use('/api/scriptdetails', require('./api/scriptdetail'));
  app.use('/api/editproject', require('./api/editproject'));
  app.use('/api/remove', require('./api/remove'));
  app.use('/api/buildnow', require('./api/buildnow'));
  app.use('/api/create', require('./api/create'));
  app.use('/api/outputs', require('./api/output'));
  app.use('/api/commits', require('./api/commit'));
  app.use('/api/builds', require('./api/build'));
  app.use('/api/projects', require('./api/project'));
  app.use('/api/things', require('./api/thing'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

};
