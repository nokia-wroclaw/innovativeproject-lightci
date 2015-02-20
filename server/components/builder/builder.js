/**
 * Created by michal on 01.12.14.
 */

'use strict';

var db = require('../../models');
var run = require('../run-script/run-script');
var _ = require('lodash');
var fs = require('fs');
var Q = require("q");
var buildQueue = require('./build-queue');

module.exports = {
  cleanPendingBuilds: cleanPendingBuilds,
  build: addToQueue,
  buildWithCommits: buildWithCommits,
  addCommits: addCommits
};

function cleanPendingBuilds() {
  var Build = db.Build;
  Build.findAll({where: {build_status: 'pending'}})
    .then(function (builds) {
      if (builds.length > 0) {
        builds.forEach(function (build) {
          build.destroy();
        });
      }
    });
};

function addCommits(project, commits) {
  db.Project.findAll({where: {project_name: project.projectName}})
    .then(function (proj) {
      var dbProject = proj[0];
      for (var i = 0; i < commits.length; i++) {
        var dbCommit = db.Commit.create({
          commit_id: commits[i]['revision'],
          commit_author: commits[i]['author'],
          commit_date: commits[i]['date'],
          commit_comment: commits[i]['message']
        });

        dbCommit.then(function (c_commit) {
          dbProject.addCommit([c_commit]);
        });
      }
    });
}


function buildWithCommits(project, commits) {
  addCommits(project, commits);
  addToQueue(project);
}

function build(project) {

  db.Project.findAll({where: {project_name: project.projectName}})
    .then(function (proj) {
      var dbProject = _.first(proj);

      db.Build.findAll({
        where: {ProjectId: dbProject.dataValues.id, build_status: 'success'},
        limit: 1,
        order: "build_date DESC"
      })
        .then(function (lastSuccessfulBuild) {
          var commitsPromise = getCommits(dbProject, lastSuccessfulBuild);

          commitsPromise.then(function (commits) {
            var dbBuild = db.Build.create({
              build_status: 'pending',
              build_date: new Date()
            });
            dbBuild.then(function (c_build) {
              var buildingResult = run.runBuildScript(project.projectName, project.scripts, c_build);
              buildingResult.then(function (isSuccess) {
                buildQueue.removeFinished(project).then(function(){
                  updateQueue();
                });

                if (isSuccess) {
                  buildDependencies(project.projectName);
                }
              });
              dbProject.addBuild([c_build]);

              for (var i = 0; i < commits.length; i++) {
                commits[i].addBuild([c_build]);
              }
            });
          });

        });
    });
}

function getCommits(dbProject, lastSuccessfulBuild) {
  if (lastSuccessfulBuild.length > 0) {
    return db.Commit.findAll({where: ["ProjectId=? and commit_date >?", dbProject.dataValues.id, _.first(lastSuccessfulBuild).dataValues.build_date]});
  } else {
    return db.Commit.findAll({where: {ProjectId: dbProject.dataValues.id}, order: "commit_date DESC"});
  }
}

function buildDependencies(projectName) {
  var projectsConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/projects.config.json"));
  _.each(projectsConfig["projects"], function (proj) {
    if (_.contains(proj.dependencies, projectName)) {
      var projectPromises = db.Project.findAll({where: {project_name: {in: proj.dependencies}}});
      var buildPromises = [];

      Q.all(projectPromises).then(function (results) {
        buildPromises = _.map(results, function (foundProject) {
          return foundProject.getBuilds({order: 'build_date DESC', limit: 1});
        });
      });

      Q.all(buildPromises).then(function (rows) {
        rows = _.reduce(rows);
        if (_.every(rows, {dataValues: {build_status: 'success'}})) {
          //build(proj);
          addToQueue(proj);
        }
      });
    }
  });
}

function updateQueue() {
  var projectsPromise = buildQueue.getProjectsToBuild();
  projectsPromise.then(function(projects){
    _.each(projects, function (project) {
      build(project);
    });
  });
};

function addToQueue(project){
  buildQueue.addToBuildQueue(project);
  updateQueue();
};

