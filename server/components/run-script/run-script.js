/**
 * Created by michal on 17.11.14.
 */
var exec = require('child-process-promise').exec;
var parser = require('../parsers/junitparser').junitParser;
var db = require('../db/db');
var websocket = require("../websocket/websocket");
var runMap = {};
var lastBuildMap = {};

function runBuildScript(projectName, scripts, build, db) {
  run(projectName, scripts, 0, db, build);
}

function run(projectName, scripts, i, db, build) {
  if (i == scripts.length) {
    db.updateInstance(build, {build_status: 'success'});
    websocket.sendProjectStatus('success', 1, projectName );
  } else if (i < scripts.length) {
    console.log("Running script",i);
    websocket.sendProjectStatus('pending', (i+1)/scripts.length, projectName );
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
        if (err.stdout && lastBuildMap[projectName]) {

            websocket.sendProjectStatus('fail', (i+1)/scripts.length, projectName );

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
  db.deleteInstance(lastBuildMap[project.project_name]).then(function(){
    lastBuildMap[project.project_name]=null;

  });
}

exports.runBuildScript = runBuildScript;
exports.cancel = cancel;
