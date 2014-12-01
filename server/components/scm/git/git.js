/**
 * Created by michal on 17.11.14.
 */
var core = require("./gitCore");
var run = require("../../run-script/run-script");
var projectDir = require('../../../config/global.config.json').checkoutDir;
var db = require('../../db/db');

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

                    // add build with pending state
                    var dbBuild = db.createInstance('Build', {
                      status: 'pending',
                      date: new Date()
                    });

                    dbBuild.then(function (c_build) {
                      run.runBuildScript(project.projectName,project.scripts,c_build,db);
                      dbProject.addBuild([c_build]);

                      for (var i = 0; i < commits.length; i++) {
                        var dbCommit = db.createInstance('Commit', {
                          revision: commits[i][0],
                          author: commits[i][1],
                          date: commits[i][3],
                          message: commits[i][4]
                        });

                        dbCommit.then(function (c_commit) {
                          dbProject.addCommit([c_commit]);
                          c_build.addCommit([c_commit]);
                        });
                      }
                    });
                  });
              });
          });
      }
    });
}

function gitClone(project) {
  core.clone(project.repositoryUrl, projectDir + "/" + project.projectName).then(function () {
    db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName})
      .then(function (dbProject) {

        var dbBuild = db.createInstance('Build', {
          status: 'pending',
          date: new Date()
        });

        dbBuild.then(function (c_build) {
          run.runBuildScript(project.projectName,project.scripts,c_build,db);
          dbProject.addBuild([c_build]);

          core.logLastCommit(projectDir + "/" + project.projectName).then(function (commit) {
            var dbCommit = db.createInstance('Commit', {
              revision: commit[0],
              author: commit[1],
              date: commit[3],
              message: commit[4]
            });

            dbCommit.then(function (c_commit) {
              dbProject.addCommit([c_commit]);
              c_build.addCommit([c_commit]);
            });
          });
        });
      });
  });
}

exports.pull = gitPull;
exports.clone = gitClone;
