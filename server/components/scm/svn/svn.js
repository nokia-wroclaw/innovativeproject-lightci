/**
 * Created by michal on 17.11.14.
 */
var core = require("./svnCore");
var run = require("../../run-script/run-script");

// callback after SVN module checkout/update
function svnSaveCommitsAndBuild(db, err, info, project) {
  if (!err) {
    var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
    dbProject.then(function (proj) {
      // project has some new commits - save commits to database
      if (info.length > 0) {
        for (var c = 0; c < info.length; c++) {
          var dbCommit = db.createInstance('Commit', info[c], proj[0]);
        }
        // and save build with new version (change date to current datetime!)
        var dbBuild = db.createInstance('Build', {
          revision: info[info.length - 1]['revision'],
          date: new Date()
        }, proj[0]);
        // run build script
        run.runBuildScript(project.projectName);
      }
    });
  }
}

function update(db, project, projectDir)
{
  core.update(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', function (err, info) {
    svnSaveCommitsAndBuild(db, err, info, project);
  });
}


function checkout(db, project, projectDir)
{
  var dbCreatedProject = db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName});
  dbCreatedProject.then(function () {
    core.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', function (err, info) {
      svnSaveCommitsAndBuild(db, err, info, project);
    });
  });
}

exports.checkout = checkout;
exports.update = update;
