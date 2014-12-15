/**
 * Created by michal on 01.12.14.
 */

var db = require("../db/db");
var run = require("../run-script/run-script");

function addCommits(project, commits) {
  db.findInstance('Project', {where: {project_name: project.projectName}})
    .then(function (proj) {
      var dbProject = proj[0];
      for (var i = 0; i < commits.length; i++) {
        var dbCommit = db.createInstance('Commit', {
          revision:   commits[i]['revision'],
          author:     commits[i]['author'],
          date:       commits[i]['date'],
          message:    commits[i]['message']
        });

        dbCommit.then(function (c_commit) {
          dbProject.addCommit([c_commit]);
        });
      }
    });
}


function buildWithCommits(project, commits) {
  addCommits(project,commits);
  build(project);

}

function build(project) {

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

function cleanPendingBuilds() {
  db.findInstance("Build", {where: {build_status: 'pending'}})
    .then(function(builds) {
      if(builds.length > 0) {
        builds.forEach(function(build) {
          db.deleteInstance(build);
        });
      }
    });
}

exports.build = build;
exports.buildWithCommits = buildWithCommits;
exports.addCommits = addCommits;
exports.cleanPendingBuilds = cleanPendingBuilds;