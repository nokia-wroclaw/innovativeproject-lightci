/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Our modules
var svn = require('./components/scm/svn/svn');
var git = require('./components/scm/git/git');
var db = require('./components/db/db');
var crontab = require('node-crontab');
var exec = require('child-process-promise').exec;
// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Read the app's config file
var globalConfigs = require("./config/global.config.json");

// Read the projects' config file
var projectConfigs = require("./config/projects.config.json");


// Create the directory path for the project
var projectDir = globalConfigs['checkoutDir'];

// A map with crontab jobId's for every running project
var jobsMap = {};

// Create new job and add jobId to the map
function addCrontabJob(key, jobCallback) {
  var jobId = jobCallback();
  jobsMap[key] = jobId;
  console.log("Current Crontab Jobs: ", jobsMap);
}

// Cancel job and remove it from the map
function removeCrontabJob(key) {
  crontab.cancelJob(jobsMap[key]);
  jobsMap[key] = null;
  console.log("Current Crontab Jobs: ", jobsMap);
}

// Prepare database tables if not existing
db.createTables(globalConfigs['databaseDir'], function () {
  // Check the repo
  projectConfigs['projects'].forEach(function (project) {
    if (project.repositoryType === 'svn') {

      var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
      dbProject.then(function (projects) {
        if (projects.length == 0) {
          var dbCreatedProject = db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName});
          dbCreatedProject.then(function (projects) {
            svn.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', function (err, info) {
              svnSaveCommitsAndBuild(err, info, project);
            });
          });

        } else {
          svn.update(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', function (err, info) {
            svnSaveCommitsAndBuild(err, info, project);
          });
        }
        addCrontabJob(project.projectName, function () {
          return crontab.scheduleJob(project.cronePattern, function (url, cwd, proj) {
            svn.update(url, cwd, '', '', function (err, info) {
	      svnSaveCommitsAndBuild(err, info, proj);
	    });
          }, [project.repositoryUrl, projectDir + "/" + project.projectName, project]);
        });
      });
    } else if (project.repositoryType === 'git') {
      var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
      dbProject.then(function (projects) {
        if (projects.length == 0) {
          git.clone(project.repositoryUrl, projectDir + "/" + project.projectName).then(function () {
            db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName})
              .then(function (Project) {
                db.createInstance('Build', {revision: "x", date: new Date()}, Project);
                runBuildScript(project.projectName);
                git.logLastCommit(projectDir + "/" + project.projectName).then(function (commit) {
                  db.createInstance('Commit', {
                    revision: commit[0],
                    author: commit[1],
                    date: commit[3],
                    message: commit[4]
                  }, Project);
                });
              });
          });
        } else {
          gitPull(project);
        }
        addCrontabJob(project.projectName, function () {
          return crontab.scheduleJob(project.cronePattern, function (proj) {
            gitPull(proj);
          }, [project]);
        });
      });

    }
    else {
      console.log("Unsupported repository: " + repoType);
    }
  });
});

// callback after SVN module checkout/update
function svnSaveCommitsAndBuild(err, info, project) {
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
	  runBuildScript(project.projectName);
	}
      });
  }
}

function gitPull(project) {
  git.pull(projectDir + "/" + project.projectName)
    .then(function (out) {
      console.log('[GIT INFO]: pull\n' + out.stdout);
      if (out.stdout != 'Already up-to-date.\n') {
        db.findInstance('Project', {where: {project_name: project.projectName}})
          .then(function (proj) {
            var dbProject = proj[0];
            db.findInstance('Build', {where: {ProjectId: dbProject.id}, limit: 1, order: 'build_date DESC'})
              .then(function (build) {
                git.logFull(projectDir + "/" + project.projectName, build[0].build_date)
                  .then(function (commits) {
                    db.createInstance('Build', {revision: "x", date: new Date()}, dbProject);
                    runBuildScript(project.projectName);
                    for (var i = 0; i < commits.length; i++) {
                      db.createInstance('Commit', {
                        revision: commits[i][0],
                        author: commits[i][1],
                        date: commits[i][3],
                        message: commits[i][4]
                      }, dbProject);
                    }
                  });
              });
          });
      }
    });
}

function runBuildScript(projectName){
  console.log("Running build script for: ", projectName);
  return exec('cd repos/'+projectName+' && sh ../../buildscripts/'+projectName+'.sh')
    .then(function (result) {
      console.log("[BUILD]: "+result.stdout);
      return result;
    })

}
// Expose app
exports = module.exports = app;
