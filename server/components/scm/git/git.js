/**
 * Created by michal on 17.11.14.
 */
var core = require("./gitCore");
var run = require("../../run-script/run-script");
var projectDir = require('../../../config/global.config.json').checkoutDir;
var db = require('../../db/db');
var builder = require('../../builder/builder');

function gitPull(project) {
  core.pull(projectDir + "/" + project.projectName)
    .then(function (out) {
      if (out.stdout != 'Already up-to-date.\n') {
        db.findInstance('Project', {where: {project_name: project.projectName}})
          .then(function (proj) {
            var dbProject = proj[0];
            db.findInstance('Build', {where: {ProjectId: dbProject.id}, limit: 1, order: 'build_date DESC'})
              .then(function (build) {
                core.logFull(projectDir + "/" + project.projectName, build[0].build_date)
                  .then(function (commits) {
                    builder.buildWithCommits(project, commitArrayToJSON(commits));
                  });
              });
          });
      }
    });
}

function gitClone(project) {
  core.clone(project.repositoryUrl, projectDir + "/" + project.projectName,project.repositoryUsername,project.repositoryPassword).then(function () {
    db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName})
      .then(function () {
        core.logLastCommit(projectDir + "/" + project.projectName).then(function (commit) {
          builder.buildWithCommits(project, commitArrayToJSON([commit]));
        });

      });
  });
}

function commitArrayToJSON(commits) {
  var res = [];
  commits.forEach(function(commit) {
    res.push(
      {
        revision: commit[0],
        author:   commit[1],
        date:     commit[3],
        message:  commit[4]
      }
    )
  });
  return res;
}

exports.pull = gitPull;
exports.clone = gitClone;
