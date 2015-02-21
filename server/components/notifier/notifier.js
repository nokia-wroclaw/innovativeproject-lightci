/**
 * Created by ms on 06.01.15.
 */

var nodemailer = require('nodemailer');
var db = require('../../models');
var _ = require('lodash');
var globalConfig = require("../../config/global.config.json");

var transporter = nodemailer.createTransport({
  service: globalConfig.notifierService,
  auth: {
    user: globalConfig.notifierUser,
    pass: globalConfig.notifierPass
  }
});

module.exports = {
  notifyAll: notifyAll,
  changeTransporter: changeTransporter
};

function changeTransporter(service, user, pass) {
  transporter = nodemailer.createTransport({
    service: service,
    auth: {
      user: user,
      pass: pass
    }
  });
}

function notifyAll(projectName) {
  var users = db.User.findAll({});
  var subject = "LightCI: Bad news :(";
  var text = "Problem with project: " + projectName;

  users.then(function (foundUsers) {
    _.each(foundUsers, function (user) {
      sendMail(user.user_email, subject, text);
    });
  });

}

function sendMail(adress, subject, text) {
  var mailOptions = {
    from: 'LightCI',
    to: adress,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
}
