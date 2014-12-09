/**
 * Created by michal on 17.11.14.
 */
var core = require("./svnCore");
var run = require("../../run-script/run-script");
var projectDir = require('../../../config/global.config.json').checkoutDir;
var db = require('../../db/db');
var builder = require('../../builder/builder');

// callback after SVN module checkout/update
function svnSaveCommitsAndBuild( err, info, project) {
  if (!err) {
      // project has some new commits - save commits to database
      if (info.length > 0) {
        builder.buildWithCommits(project, info);
      }
  }
}

function update(project)
{
  core.update(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword, function (err, info) {
    svnSaveCommitsAndBuild(err, info, project);
  });
}


function checkout(project)
{
  var dbCreatedProject = db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName});
  dbCreatedProject.then(function () {
    core.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword, function (err, info) {
      svnSaveCommitsAndBuild(err, info, project);
    });
  });
}

exports.clone = checkout;
exports.pull = update;
