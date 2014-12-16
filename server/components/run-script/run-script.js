/**
 * Created by michal on 17.11.14.
 */
var exec = require('child-process-promise').exec;
var parser = require('../parsers/junitparser').junitParser;
var db = require('../db/db');
var websocket = require("../websocket/websocket");
var fs = require("fs");
var builder = require("../builder/builder");
var runMap = {};
var _ = require("lodash");
var lastBuildMap = {};

function runBuildScript(projectName, scripts, build, db) {
  run(projectName, scripts, 0, db, build);
}

function run(projectName, scripts, i, db, build) {
  if (i == scripts.length) {
    var project = db.findInstance('Project', {where: {project_name: projectName}});


    project.then(function(resultProjects){
      var builds = db.findInstance('Build', {where: {ProjectId: _.first(resultProjects).id}});

      builds.then(function(resultBuilds){
        var oldAverageTime = _.first(resultProjects).project_average_build_time;
        if(_.isNull(oldAverageTime) || _.isNaN(oldAverageTime)){
          oldAverageTime = new Date(0);
        }
        var currentBuildTime = new Date().getTime()-build.build_date.getTime();
        var averageTime = (currentBuildTime+(resultBuilds.length-1)*oldAverageTime.getTime())/resultBuilds.length;
        db.updateInstance(_.first(resultProjects),{project_average_build_time:new Date(averageTime)});

      });
    });
    db.updateInstance(build, {build_status: 'success'}).then(function() {
      websocket.sendProjectStatus('success', 1, projectName );
      var projectsConfig = JSON.parse(fs.readFileSync(__dirname+"/../../config/projects.config.json"));
      projectsConfig["projects"].forEach(function(proj) {
        if(_.contains(proj.dependencies, projectName))
        {
          db.getSequelize().query("SELECT `b`.`id`, `p`.`project_name`, `b`.`build_date`, `b`.`build_status` FROM `Builds` AS `b` JOIN `Projects` AS `p` ON `b`.`ProjectId` = `p`.`id` WHERE `p`.`project_name` IN ('"+proj.dependencies.join("','")+"') GROUP BY `p`.`id` ORDER BY `b`.`build_date` DESC", null, { logging: console.log, raw: true})
            .success(function(rows) {
              if(_.every(rows, { build_status: 'success'}))
              {
                builder.build(proj);
              }
            });
        }

      });
    });

  } else if (i < scripts.length) {
    console.log("Running script", i);

    websocket.sendProjectStatus('pending', (i) / scripts.length, projectName);

    lastBuildMap[projectName] = build;

    var newBuildOutput = db.createInstance('BuildOutputs', {
      scriptName: scripts[i].scriptName,
      output: "",
      isSuccess: false
    });

    var buildOut = newBuildOutput.then(function (out) {
      build.addBuildOutput([out]);
      return out;
    });
    buildOut.then(function(out) {
      exec('cd repos/' + projectName + ' && sh ../../buildscripts/' + projectName + '/' + scripts[i].scriptName)
        .then(function (result) {
          db.updateInstance(out, {isSuccess: true});
          parser(projectName, scripts[i], out, db);
          run(projectName, scripts, i + 1, db, build);
        })
        .fail(function (err) {
          if (err.stdout && lastBuildMap[projectName]) {
            websocket.sendProjectStatus('fail', (i + 1) / scripts.length, projectName);
            parser(projectName, scripts[i], out, db);
            db.updateInstance(build, {build_status: 'fail'});
          }
        })
        .progress(function (childProcess) {
          runMap[projectName] = childProcess;
          var buff = "";
          childProcess.stdout.on('data', function (chunk) {
            buff += chunk;
            db.updateInstance(out, {output: buff});
            global.webSockets.emit('console_update', {});
          })
        });
    });
  }
}

function cancel(project) {
  runMap[project.project_name].kill('SIGHUP');
  db.deleteInstance(lastBuildMap[project.project_name]).then(function () {
    lastBuildMap[project.project_name] = null;

  });
}

exports.runBuildScript = runBuildScript;
exports.cancel = cancel;
