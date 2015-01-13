/**
 * Created by michal on 17.11.14.
 */

'use strict';

var exec = require('child-process-promise').exec;
var parser = require('../parsers/junitparser').junitParser;
var db;
var websocket = require("../websocket/websocket");
var deploy;
var fs = require("fs");
var builder;
var runMap = {};
var _ = require("lodash");
var lastBuildMap = {};
var Q = require("q");
var notifier;

module.exports = function(models){
  db = models;
  builder = require("../builder/builder")(db,this);
  deploy = require("../deploy/deploy")(db);
  notifier = require('../notifier/notifier.js')(db);

  return {
    runBuildScript : runBuildScript,
    cancel : cancel
  };
};

function runBuildScript(projectName, scripts, build) {
  run(projectName, scripts, 0, build);
}

function run(projectName, scripts, i, build) {
  if (i == scripts.length) {
    var project = db.Project.findAll({where: {project_name: projectName}});


    project.then(function(resultProjects){
      var builds = db.Build.findAll({where: {ProjectId: _.first(resultProjects).id}});

      builds.then(function(resultBuilds){
        var oldAverageTime = _.first(resultProjects).project_average_build_time;
        if(_.isNull(oldAverageTime) || _.isNaN(oldAverageTime)){
          oldAverageTime = new Date(0);
        }
        var currentBuildTime = new Date().getTime()-build.build_date.getTime();
        var averageTime = (currentBuildTime+(resultBuilds.length-1)*oldAverageTime.getTime())/resultBuilds.length;
        _.first(resultProjects).updateAttributes({project_average_build_time:new Date(averageTime)});
      });

    });
    build.updateAttributes({build_status: 'success'}).then(function() {
      websocket.sendProjectStatus('success', 1, projectName );
      var projectsConfig = JSON.parse(fs.readFileSync(__dirname+"/../../config/projects.config.json"));

      _.each(projectsConfig["projects"], function(proj) {
        if(_.contains(proj.dependencies, projectName)) {
          var projectPromises = db.Project.findAll({where:{project_name: {in: proj.dependencies} }});
          var buildPromises =[];

          Q.all(projectPromises).then(function(results){
            buildPromises = _.map(results,function (foundProject){
              return foundProject.getBuilds({order: 'build_date DESC', limit: 1});
            });
          });

          Q.all(buildPromises).then(function (rows) {
            rows = _.reduce(rows);
            if (_.every(rows, {dataValues:{build_status: 'success'}})) {
              builder.build(proj);
            }
          });
        }
      });

      var project = _.find(projectsConfig.projects,function(proj){
        return projectName === proj.projectName;
      });
      if(project.useDeployServer)
        deploy.deploy(project,build);
    });

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
    buildOut.then(function(out) {
      exec('cd repos/' + projectName + ' && sh ../../buildscripts/' + projectName + '/' + scripts[i].scriptName)
        .then(function (result) {
          out.updateAttributes({isSuccess: true, output: _.escape(result.stdout + "\n\nScript success")});
          parser(projectName, scripts[i], out, db);
          run(projectName, scripts, i + 1, build);
        })
        .fail(function (err) {
          out.updateAttributes({isSuccess: false, output: _.escape(err.stdout + "\n\nScript failed due to return code 1")});
          if (err.stdout && lastBuildMap[projectName]) {
            websocket.sendProjectStatus('fail', (i + 1) / scripts.length, projectName);
            parser(projectName, scripts[i], out, db);
            build.updateAttributes({build_status: 'fail'});
            notifier.notifyAll(projectName);
          }
        })
        .progress(function (childProcess) {
          runMap[projectName] = childProcess;
          var buff = "";
          childProcess.stdout.on('data', function (chunk) {
            buff += chunk;
            out.updateAttributes({output: _.escape(buff)});
            global.webSockets.emit('console_update', {});
          })
        });
    });
  }
}

function cancel(project) {
    runMap[project.project_name].kill('SIGHUP');
    db.Build.distroy(lastBuildMap[project.project_name]).then(function () {
    lastBuildMap[project.project_name] = null;
  });
};
