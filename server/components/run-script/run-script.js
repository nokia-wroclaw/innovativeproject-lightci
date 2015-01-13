/**
 * Created by michal on 17.11.14.
 */

'use strict';

var exec = require('child-process-promise').exec;
var parser = require('../parsers/junitparser').junitParser;
var db = require('../../models');
var websocket = require("../websocket/websocket");
var deploy = require("../deploy/deploy");
var runMap = {};
var _ = require("lodash");
var lastBuildMap = {};
var notifier = require('../notifier/notifier.js');
var fs = require('fs');


function runBuildScript(projectName, scripts, build) {
  return run(projectName, scripts, 0, build);
}

function run(projectName, scripts, i, build) {
  if (i == scripts.length) {
    var project = db.Project.findAll({where: {project_name: projectName}});


    project.then(function (resultProjects) {
      var builds = db.Build.findAll({where: {ProjectId: _.first(resultProjects).id}});

      builds.then(function (resultBuilds) {
        var oldAverageTime = _.first(resultProjects).project_average_build_time;
        if (_.isNull(oldAverageTime) || _.isNaN(oldAverageTime)) {
          oldAverageTime = new Date(0);
        }
        var currentBuildTime = new Date().getTime() - build.build_date.getTime();
        var averageTime = (currentBuildTime + (resultBuilds.length - 1) * oldAverageTime.getTime()) / resultBuilds.length;
        _.first(resultProjects).updateAttributes({project_average_build_time: new Date(averageTime)});
      });

    });
    build.updateAttributes({build_status: 'success'}).then(function () {
      websocket.sendProjectStatus('success', 1, projectName);
      var projectsConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/projects.config.json"));


      var project = _.find(projectsConfig.projects, function (proj) {
        return projectName === proj.projectName;
      });
      if (project.useDeployServer)
        deploy.deploy(project, build);
    });
    return true;

  } else if (i < scripts.length) {
    console.log("Running script", i);

    websocket.sendProjectStatus('pending', (i) / scripts.length, projectName);

    lastBuildMap[projectName] = build;

    var newBuildOutput = db.ScriptOutput.create({
      scriptName: scripts[i].scriptName,
      output: "",
      isSuccess: null
    });

    var buildOut = newBuildOutput.then(function (out) {
      build.addScriptOutput([out]);
      return out;
    });
    return buildOut.then(function (out) {
      return exec('cd repos/' + projectName + ' && sh ../../buildscripts/' + projectName + '/' + scripts[i].scriptName)
        .then(function (result) {
          if(lastBuildMap[projectName]) {
            out.updateAttributes({isSuccess: true, output: _.escape(result.stdout + "\n\nScript success")});
            parser(projectName, scripts[i], out, db);
          }

          return run(projectName, scripts, i + 1, build);
        })
        .fail(function (err) {
          if(lastBuildMap[projectName]) out.updateAttributes({
            isSuccess: false,
            output: _.escape(err.stdout + "\n\nScript failed due to return code 1")
          });
          if (err.stdout && lastBuildMap[projectName]) {
            websocket.sendProjectStatus('fail', (i + 1) / scripts.length, projectName);
            parser(projectName, scripts[i], out, db);
            build.updateAttributes({build_status: 'fail'});
            notifier.notifyAll(projectName);
          }
          return false;
        })
        .progress(function (childProcess) {
          runMap[projectName] = childProcess;
          var buff = "";
          if(childProcess) childProcess.stdout.on('data', function (chunk) {
            buff += chunk;
            if(lastBuildMap[projectName]) { out.updateAttributes({output: _.escape(buff)}); }
            global.webSockets.emit('console_update', {});
          })
        });
    });
  }
}

function cancel(project) {
  runMap[project.project_name].kill('SIGHUP');
  lastBuildMap[project.project_name].destroy();
  lastBuildMap[project.project_name] = null;
  
  var lastbuild = project.getBuilds({where: {build_status: {in: ['fail','success']}}, order: 'build_date DESC', limit: 1});
  lastbuild.then(function(build) {
    websocket.sendProjectStatus(_.first(build).dataValues.build_status, 1, project.project_name);
  });


}

module.exports = {
  runBuildScript: runBuildScript,
  cancel: cancel
};
