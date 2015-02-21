'use strict';

var _ = require('lodash');
require('../../components/passport/passport')(global.passport);
var db = require('../../models');

// Get all users
exports.index = function(req, res) {
  db.User.findAll({})
    .then(function (users) {
      res.json(users);
    });
}

// Register user
exports.create = passport.authenticate('local-signup', {
  successRedirect : '/',
  failureRedirect : '/signup',
  failureFlash : true
});

// Log user in
exports.update = passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
});
