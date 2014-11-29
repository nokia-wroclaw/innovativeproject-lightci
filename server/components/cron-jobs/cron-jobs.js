/**
 * Created by michal on 24.11.14.
 */
var crontab = require('node-crontab');
var db = require('../db/db');
var scm = require('../scm/scmManager');

// Create new job and add jobId to the map
function addCrontabJob(project) {
  var jobCallback= function () {
      return crontab.scheduleJob(project.cronePattern, function (cron_project) {
        console.log("Crontab job",cron_project.projectName);
        scm.pull(cron_project);
      }, [project]);
    };

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
