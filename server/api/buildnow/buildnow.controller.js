'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');
var run = require("../../components/run-script/run-script");

// Execute build
exports.create = function(req, res) {

  db.findInstance('Project', {where: {id: req.body.project_id}})
    .then(function (proj) {

      var dbProject = proj[0];
      var projectConfigs = require("../../config/projects.config.json");

      projectConfigs['projects'].forEach( function(project) {
        if (project['projectName'] === dbProject.project_name) {

          // add build with pending state
          var dbBuild = db.createInstance('Build', {
            issuccess: false,
            ispending: true,
            date: new Date()
          });

          dbBuild.then(function (c_build) {
            run.runBuildScript(project.projectName, project.scripts, c_build, db);
            //db.updateInstance(c_build, { build_ispending: false, build_issuccess: true });
            dbProject.addBuild([c_build]);
          });
        }
      });
  });
};
