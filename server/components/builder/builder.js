/**
 * Created by michal on 01.12.14.
 */

var db;
var run;

module.exports = function (models, runScript) {
  db = models;
  run = runScript;
  return {
    cleanPendingBuilds: cleanPendingBuilds,
    build : build,
    buildWithCommits : buildWithCommits,
    addCommits : addCommits
  };
};


function cleanPendingBuilds() {
  var Build = db.Build;
  Build.findAll({where: {build_status: 'pending'}})
    .then(function (builds) {
      if (builds.length > 0) {
        builds.forEach(function (build) {
          build.destroy();
        });
      }
    });
};

function addCommits(project, commits) {
  db.Project.findAll({where: {project_name: project.projectName}})
    .then(function (proj) {
      var dbProject = proj[0];
      for (var i = 0; i < commits.length; i++) {
        var dbCommit = db.Commit.create({
          commit_id: commits[i]['revision'],
          commit_author: commits[i]['author'],
          commit_date: commits[i]['date'],
          commit_comment: commits[i]['message']
        });

        dbCommit.then(function (c_commit) {
          dbProject.addCommit([c_commit]);
        });
      }
    });
}


function buildWithCommits(project, commits) {
  addCommits(project, commits);
  build(project);

}

function build(project) {

  db.Project.findAll({where: {project_name: project.projectName}})
    .then(function (proj) {
      var dbProject = proj[0];

      db.Build.findAll({
        where: {ProjectId: dbProject.dataValues.id, build_status: 'success'},
        limit: 1,
        order: "build_date DESC"
      })
        .then(function (lastSuccessfulBuild) {
          if (lastSuccessfulBuild.length > 0) {
            db.Commit.findAll({where: ["ProjectId=? and commit_date >?", dbProject.dataValues.id, lastSuccessfulBuild[0].dataValues.build_date]})
              .then(function (commits) {
                var dbBuild = db.Build.create({
                  build_status: 'pending',
                  build_date: new Date()
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
            db.Commit.findAll({where: {ProjectId: dbProject.dataValues.id}, order: "commit_date DESC"})
              .then(function (commits) {
                var dbBuild = db.Build.create({
                  build_status: 'pending',
                  build_date: new Date()
                });
                dbBuild.then(function (c_build) {
                  run.runBuildScript(project.projectName, project.scripts, c_build);
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



