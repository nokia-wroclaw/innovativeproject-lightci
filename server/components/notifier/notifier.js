/**
 * Created by ms on 06.01.15.
 */

var Gmailer = require("gmail-sender");
var models;
var _ = require('lodash');
Gmailer.options({
  smtp: {
    service: "Gmail",
    user: "lightcilightci@gmail.com",
    pass: "lightcilightci1"
  }
});

module.exports = function(db){
  models = db;
  return {
    notifyAll: notifyAll
  };
};

function notifyAll(projectName) {
  var users = models.User.findAll({});
  var subject = "LightCI: Bad news :(";
  var text = "Problem with project " + projectName;

  users.then(function(foundUsers){
    _.each(foundUsers,function(user){
      sendMail(user.user_email,subject,text);
    });
  });

}

function sendMail(adress,subject,text){
  Gmailer.send({
    subject: subject,
    text: text,
    from: "LightCI",
    to: {
      email: adress
    },
  });

}
