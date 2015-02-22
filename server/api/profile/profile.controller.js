'use strict';

var _ = require('lodash');
var db = require('../../models');
var notifier = require('../../components/notifier/notifier');

exports.update = function(req, res) {
  var email = req.body.email;
  var oldpass = req.body.oldpassword;
  var newpass = req.body.newpassword;
  var accounts = req.body.accounts;
  var user = req.user;

  db.UserRepo.findAll({ where: {UserId: user.id}}).then(function(userRepos) {
    _.forEach(userRepos, function(entry) {
      entry.destroy();
    });
  });

  _.forEach(accounts, function(entry) {
    db.UserRepo.create(entry).then(function (t) {
      user.addUserRepo(t);
    });
  });

  if (newpass) {
    if (db.User.validPassword(oldpass,user)) {
      user.updateAttributes({user_pass: db.User.generateHash(newpass)});
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

exports.index = function(req, res) {
  var user = req.user;
  db.UserRepo.findAll({ where: {UserId: req.user.id}}).then(function(userRepos) {
    user = {
      id: user.id,
      user_name: user.user_name,
      user_email: user.user_email,
      user_pass: user.user_pass,
      accounts: []
    }
    _.forEach(userRepos, function(entry) {
      user.accounts.push(entry);
    });

    res.json(user);
  });
};

exports.create = function(req, res) {
  var email = req.body.email;
  var pass = randomString(8);
  var hash = db.User.generateHash(pass);
  var subject = "LightCI - Account password reset";
  var text = "Your password has been reset. Your new password: "+pass;

  db.User.findAll({where: { user_email: email }}).then(function(user) {
    if (user.length>0) {
      _.first(user).updateAttributes({user_pass: hash});
      notifier.sendMail(email, subject, text);

      req.flash('loginMessage', 'Your password has been reset. Please check your email.');
      res.redirect("/login");
    } else {
      req.flash('loginMessage', 'Account with given email does not exist.');
      res.redirect("/login");
    }
  });
};

function randomString(length)
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

