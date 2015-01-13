/**
 * Created by michal on 17.11.14.
 */
var core = require("./gitCore");
var run = require('../../run-script/run-script');
var projectDir = require('../../../config/global.config.json').checkoutDir;
var exec = require('child-process-promise').exec;
var db = require('../../../models');
var builder = require('../../builder/builder');

function gitPull(project) {
  core.pull(projectDir + "/" + project.projectName)
    .then(function (out) {
      if (out.stdout != 'Already up-to-date.\n') {
        db.Project.findAll({where: {project_name: project.projectName}})
          .then(function (proj) {
            var dbProject = proj[0];
            db.Build.findAll({where: {ProjectId: dbProject.id}, limit: 1, order: 'build_date DESC'})
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

function gitCloneAgain(project) {
  isUpToDate(project).then(function (result) {
    if (result == false) {
      exec("rm -r '" + __dirname + "/../../../../repos/" + project.projectName + "'").then(function () {
        core.clone(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword).then(function () {
          db.Project.findAll({where: {project_name: project.projectName}})
            .then(function (proj) {
              var dbProject = proj[0];
              db.Build.findAll({where: {ProjectId: dbProject.id}, limit: 1, order: 'build_date DESC'})
                .then(function (build) {
                  core.logFull(projectDir + "/" + project.projectName, build[0].build_date)
                    .then(function (commits) {
                      builder.buildWithCommits(project, commitArrayToJSON(commits));
                    });
                });
            });
        });
      }).fail(function (err) {
        console.log("Couldn't remove previous working copy of " + project.projectName);
      });
    }
  });
}

function gitClone(project) {
  core.clone(project.repositoryUrl, projectDir + "/" + project.projectName, project.repositoryUsername, project.repositoryPassword).then(function () {
    db.Project.create({
      project_url: project.repositoryUrl,
      project_name: project.projectName,
      project_average_build_time: null
    })
      .then(function () {
        core.logLastCommit(projectDir + "/" + project.projectName).then(function (commit) {
          builder.buildWithCommits(project, commitArrayToJSON([commit]));
        });

      });
  });
}

function commitArrayToJSON(commits) {
  var res = [];
  commits.forEach(function (commit) {
    res.push(
      {
        revision: commit[0],
        author: commit[1],
        date: commit[3],
        message: commit[4]
      }
    )
  });
  return res;
}

function isUpToDate(project) {
  return core.isUpToDate(projectDir + "/" + project.projectName);
}
module.exports = {
  pull: gitPull,
  clone: gitClone,
  cloneAgain: gitCloneAgain,
  isUpToDate: isUpToDate
};

