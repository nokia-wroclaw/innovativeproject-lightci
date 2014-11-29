'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');
var run = require("../../components/run-script/run-script");

// Execute build
exports.create = function(req, res) {

  db.findInstance('Project', {where: {id: req.body.project_id}})
    .then(function (proj) {

      var dbProject = _.first(proj).dataValues;
      // add build with pending state
      var dbBuild = db.createInstance('Build', {
        issuccess: false,
        ispending: true,
        date: new Date()
      });
      var confProj = require('../../config/projects.config.json').projects;
      var buildPromise = dbBuild.then(function (c_build) {
        confProj = _.filter(confProj,function(proj){
          return proj.projectName == dbProject.project_name;
        });
         return c_build;
      });

      buildPromise.then(function(c_build){
        var targetProject = _.first(confProj);
        run.runBuildScript(targetProject.projectName, targetProject.scripts, c_build, db);
        _.first(proj).addBuild([c_build]);
      });
  });
};
