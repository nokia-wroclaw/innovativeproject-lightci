'use strict';

var _ = require('lodash');

// Get list of users
exports.create = passport.authenticate('local-signup', {
  successRedirect : '/',
  failureRedirect : '/signup',
  failureFlash : true
});
