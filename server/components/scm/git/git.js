/**
 * Created by michal on 17.11.14.
 */
var core = require("./gitCore");
var run = require("../../run-script/run-script");

function gitPull(db, project, projectDir) {
  core.pull(projectDir + "/" + project.projectName)
    .then(function (out) {
      console.log('[GIT INFO]: pull\n' + out.stdout);
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
                      issuccess: false,
                      ispending: true,
                      date: new Date()
                    });

                    dbBuild.then(function (c_build) {
                      run.runBuildScript(project.projectName,project.scripts,c_build,db);
                      //db.updateInstance(c_build, { build_ispending: false, build_issuccess: true });
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

function gitClone(db, project, projectDir) {
  core.clone(project.repositoryUrl, projectDir + "/" + project.projectName).then(function () {
    db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName})
      .then(function (dbProject) {

        var dbBuild = db.createInstance('Build', {
          issuccess: false,
          ispending: true,
          date: new Date()
        });

        dbBuild.then(function (c_build) {
          run.runBuildScript(project.projectName,project.scripts,c_build,db);
          //db.updateInstance(c_build, { build_ispending: false, build_issuccess: true });
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

exports.gitPull = gitPull;
exports.gitClone = gitClone;
