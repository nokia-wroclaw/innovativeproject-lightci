/**
 * Created by michal on 01.12.14.
 */

var db = require("../db/db");
var run = require("../run-script/run-script");

function build(project, commits) {

  db.findInstance('Project', {where: {project_name: project.projectName}})
    .then(function (proj) {
    var dbProject = proj[0];


    var dbBuild = db.createInstance('Build', {
      status: 'pending',
      date: new Date()
    });

    dbBuild.then(function (c_build) {
      run.runBuildScript(project.projectName, project.scripts, c_build, db);
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
}

function buildNow(project) {

  db.findInstance('Project', {where: {project_name: project.projectName}})
    .then(function (proj) {
      var dbProject = proj[0];

      db.findInstance('Build', {
        where: {ProjectId: dbProject.dataValues.id, build_status: 'success'},
        limit: 1,
        order: "build_date DESC"
      })
        .then(function (lastSuccessfulBuild) {
          if (lastSuccessfulBuild.length > 0) {
            console.log(lastSuccessfulBuild);
            db.findInstance('Commit', {where: ["ProjectId=? and commit_date >?", dbProject.dataValues.id, lastSuccessfulBuild[0].dataValues.build_date]})
              .then(function (commits) {
                var dbBuild = db.createInstance('Build', {
                  status: 'pending',
                  date: new Date()
                });
                dbBuild.then(function (c_build) {
                  run.runBuildScript(project.projectName, project.scripts, c_build, db);
                  dbProject.addBuild([c_build]);

                  for (var i = 0; i < commits.length; i++) {
                    commits[i].addBuild([c_build]);
                  }
                });

              });
          } else {
            db.findInstance('Commit', {where: {ProjectId: dbProject.dataValues.id}, order: "commit_date DESC"})
              .then(function (commits) {
                var dbBuild = db.createInstance('Build', {
                  status: 'pending',
                  date: new Date()
                });
                dbBuild.then(function (c_build) {
                  run.runBuildScript(project.projectName, project.scripts, c_build, db);
                  dbProject.addBuild([c_build]);

                  for (var i = 0; i < commits.length; i++) {
                    commits[i].addBuild([c_build]);
                  }
                });

              });
          }
        });

    });

}

exports.build = build;
exports.buildNow = buildNow;
