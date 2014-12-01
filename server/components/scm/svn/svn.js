/**
 * Created by michal on 17.11.14.
 */
var core = require("./svnCore");
var run = require("../../run-script/run-script");
var projectDir = require('../../../config/global.config.json').checkoutDir;
var db = require('../../db/db');
// callback after SVN module checkout/update
function svnSaveCommitsAndBuild( err, info, project) {
  if (!err) {
    var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
    dbProject.then(function (proj) {
      // project has some new commits - save commits to database
      if (info.length > 0) {

        // and save build with pending state
        var dbBuild = db.createInstance('Build', {
          status: 'pending',
          date: new Date()
        });

        // run build script

        dbBuild.then(function (build) {
          run.runBuildScript(project.projectName,project.scripts,build,db);

          //db.updateInstance(build, { build_ispending: false, build_issuccess: true });
          proj[0].addBuild([build]);

          for (var c = 0; c < info.length; c++) {
            var dbCommit = db.createInstance('Commit', info[c]);

            dbCommit.then(function (commit) {
              proj[0].addCommit([commit]);
              build.addCommit([commit]);
            });
          }
        });
      }
    });
  }
}

function update(project)
{
  core.update(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', function (err, info) {
    svnSaveCommitsAndBuild(err, info, project);
  });
}


function checkout(project)
{
  var dbCreatedProject = db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName});
  dbCreatedProject.then(function () {
    core.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', function (err, info) {
      svnSaveCommitsAndBuild(err, info, project);
    });
  });
}

exports.clone = checkout;
exports.pull = update;
