'use strict';

var _ = require('lodash');
require('../../components/passport/passport')(global.passport);

// Log user in
exports.create = function(req,res) {
  passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  });
};

