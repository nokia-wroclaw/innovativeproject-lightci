/**
 * Created by michal on 24.11.14.
 */
var crontab = require('node-crontab');
var projectDir = require("../../config/global.config.json")['checkoutDir'];
var db = require('../db/db');
var svn = require('../scm/svn/svn');
var git = require('../scm/git/git');

// Create new job and add jobId to the map
function addCrontabJob(project) {
  var jobCallback;

  if (project.repositoryType == 'svn') {
    jobCallback = function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_db, cron_project, cron_projectDir) {
        console.log("Crontab job",cron_project.projectName);
        svn.update(cron_db, cron_project, cron_projectDir);
      }, [db, project, projectDir]);
    };
  } else if (project.repositoryType == 'git') {
    jobCallback = function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_db, cron_project, cron_projectDir) {
        console.log("Crontab job",cron_project.projectName);
        git.gitPull(cron_db, cron_project, cron_projectDir);
      }, [db, project, projectDir]);
    }
  }
  if (jobCallback) {
    var jobId = jobCallback();
    global.jobsMap[project.projectName] = jobId;
  }
  else
  {
    console.log("Error: add crontab job");
  }
  console.log("Current Crontab Jobs: ", global.jobsMap);
}

// Cancel job and remove it from the map
function removeCrontabJob(key) {
  crontab.cancelJob(global.jobsMap[key]);
  global.jobsMap[key] = null;
  console.log("Current Crontab Jobs: ", global.jobsMap);
}

exports.addCrontabJob = addCrontabJob;
exports.removeCrontabJob = removeCrontabJob;
