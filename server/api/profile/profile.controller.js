'use strict';

var _ = require('lodash');
var db = require('../../models');

exports.update = function(req, res) {
  var email = req.body.email;
  var notifications = req.body.notifications;
  var oldpass = req.body.oldpassword;
  var newpass = req.body.newpassword;
  var user = req.user;

  if (newpass) {
    if (user.user_pass === oldpass) {
      user.updateAttributes({user_pass: newpass});
      res.json({info: "Nice", error: null});
    } else {
      res.json({info: null, error: "Incorrect password!"});
    }
  }

  if (email && email !== user.user_email) {
    user.updateAttributes({user_email: email});
    res.json({info: "Nice", error: null});
  }

  res.json({info: "Nice", error: null});
};

exports.show = function(req, res) {
  res.json(req.user);
};
