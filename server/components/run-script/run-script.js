/**
 * Created by michal on 17.11.14.
 */
var exec = require('child-process-promise').exec;
var parser = require('../parsers/junitparser').junitParser;
var db = require('../db/db');
var runMap = {};
var lastBuildMap = {};

function runBuildScript(projectName, scripts, build, db) {
  run(projectName, scripts, 0, db, build);
}

function run(projectName, scripts, i, db, build) {
  if (i == scripts.length) {
    db.updateInstance(build, {build_status: 'success'});
  } else if (i < scripts.length) {
    lastBuildMap[projectName] = build;
    exec('cd repos/' + projectName + ' && sh ../../buildscripts/' + projectName + '/' + scripts[i].scriptName)
      .then(function (result) {
        db.createInstance('BuildOutputs', {
          scriptName: scripts[i].scriptName,
          output: result.stdout,
          isSuccess: true
        }).then(function (out) {
          build.addBuildOutput([out]);
          parser(projectName, scripts[i], out, db);
        });
        run(projectName, scripts, i + 1, db, build);
      })
      .fail(function (err) {
        if (err.stdout &&  project.project_name) {

            db.createInstance('BuildOutputs', {
              scriptName: scripts[i].scriptName,
              output: err.stdout,
              isSuccess: false
            }).then(function (out) {
              build.addBuildOutput([out]);
              parser(projectName, scripts[i], out, db);
            }).then(function () {
              db.updateInstance(build, {build_status: 'fail'});
            });

        }
      })
      .progress(function (childProcess) {
        runMap[projectName] = childProcess;
      });
  }
}

function cancel(project) {
  runMap[project.project_name].kill('SIGHUP');
  db.deleteInstance(lastBuildMap[project.project_name]);
  project.project_name == null;
}

exports.runBuildScript = runBuildScript;
exports.cancel = cancel;
