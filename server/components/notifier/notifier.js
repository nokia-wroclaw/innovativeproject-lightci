/**
 * Created by ms on 06.01.15.
 */

var nodemailer = require('nodemailer');
var db = require('../../models');
var _ = require('lodash');
var globalConfig = require("../../config/global.config.json");
var config = require("../../config/projects.config.json");

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

function notifyAll(projectName, build) {
  var project = _.find(config.projects, function (proj) {
    return projectName === proj.projectName;
  });

  var mailArray;

  if(project.notifyStrategy != 'none') {


    var subject = "LightCI: Bad news :(";
    var text = "Problem with project: " + projectName;

    if(project.notifyStrategy == 'all') {

      var users = db.User.findAll({});
      users.then(function (foundUsers) {
        _.each(foundUsers, function (user) {
          sendMail(user.user_email, subject, text);
        });
      });

    } else if(project.notifyStrategy == 'assigned') {

      _.each(project.assignedUsers, function(mail) {
        sendMail(mail, subject, text);
      });

    } else if(project.notifyStrategy == 'repoUsers') {

      console.log("HERE");


        build.getCommits().success(function (commits) {

          if(project.repositoryType == 'git') {
            _.each(commits, function (commit) {
              sendMail(commit.dataValues.commit_author, subject, text);
            });
          }
          else {
            var user_list = [];
            _.each(commits, function(commit) {
              user_list = _.union(user_list,[commit.dataValues.commit_author]);
            });

            var repo_users = db.UserRepo.findAll({
              where: {
                repo_address: project.repositoryUrl,
                repo_type: project.repositoryType,
                repo_name: { in: user_list}
              }
            });
            repo_users.then(function(repoUsers) {
              _.each(repoUsers, function(repo_user) {
                var user = repo_user.getUser();
                user.then(function (dbUser) {
                  sendMail(dbUser.dataValues.user_email, subject, text);
                });
              });
            });

          }

        });
      }
    }

}

function sendMail(address, subject, text) {
  var mailOptions = {
    from: 'LightCI',
    to: address,
    subject: subject,
    text: text
  };

  console.log("[notifier] sending email notification to "+address);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
}
