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

function addProject(project)
{
  if (project.repositoryType === 'svn') {

    svn.checkout(db, project, projectDir);

    addCrontabJob(project.projectName, function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_db, cron_project, cron_projectDir) {
        svn.update(cron_db, cron_project, cron_projectDir);
      }, [db, project, projectDir]);
    });

  } else if (project.repositoryType === 'git') {

     git.gitClone(db,project,projectDir);

    addCrontabJob(project.projectName, function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_db, cron_project, cron_projectDir) {
        git.gitPull(cron_db, cron_project, cron_projectDir);
      }, [db, project, projectDir]);
    });

  }
  else {
    console.log("Unsupported repository: " + repoType);
  }
}

function updateProject(project)
{
  if (project.repositoryType === 'svn') {

    svn.update(db, project, projectDir);

    addCrontabJob(project.projectName, function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_db, cron_project, cron_projectDir) {
        svn.update(cron_db, cron_project, cron_projectDir);
      }, [db, project, projectDir]);
    });

  } else if (project.repositoryType === 'git') {

    git.gitPull(db, project, projectDir);

    addCrontabJob(project.projectName, function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_db, cron_project, cron_projectDir) {
        git.gitPull(cron_db, cron_project, cron_projectDir);
      }, [db, project, projectDir]);
    });

  }
  else {
    console.log("Unsupported repository: " + repoType);
  }
}

// Prepare database tables if not existing
db.createTables(globalConfigs['databaseDir'], function () {
  // Check the repo
  projectConfigs['projects'].forEach(function (project) {
    var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
    dbProject.then(function (projects) {
      if (projects.length == 0) {
        addProject(project)
      } else
        updateProject(project);
    });
  });
});


// Expose app
exports = module.exports = app;
