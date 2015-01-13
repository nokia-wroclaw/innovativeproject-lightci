/**
 * Created by michal on 17.11.14.
 */
var core = require("./svnCore");
var run = require('../../run-script/run-script');
var projectDir = require('../../../config/global.config.json').checkoutDir;
var exec = require('child-process-promise').exec;
var db = require('../../../models');
var builder = require('../../builder/builder');

// callback after SVN module checkout/update
function svnSaveCommitsAndBuild(err, info, project) {
  if (!err) {
    // project has some new commits - save commits to database
    if (info.length > 0) {
      builder.buildWithCommits(project, info);
    }
  }
};

function update(project) {
  core.update(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword, function (err, info) {
    svnSaveCommitsAndBuild(err, info, project);
  });
};

function checkoutAgain(project) {
  core.getNewCommits(projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword, function (err, commits) {
    if (!err) {
      if (commits[0]) {
        exec("rm -r '" + __dirname + "/../../../../repos/" + project.projectName + "'").then(function (result) {
          core.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword, function (err, info) {
            svnSaveCommitsAndBuild(err, commits, project);
          });
        }).fail(function (err) {
          console.log("Couldn't remove previous working copy of " + project.projectName);
        });
      }
    }
  });
};

function checkout(project) {
  var dbCreatedProject = db.Project.create({
    project_url: project.repositoryUrl,
    project_name: project.projectName,
    project_average_build_time: null
  });
  dbCreatedProject.then(function () {
    core.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword, function (err, info) {
      svnSaveCommitsAndBuild(err, info, project);
    });
  });
};

module.exports = {
  clone: checkout,
  pull: update,
  cloneAgain: checkoutAgain
};
