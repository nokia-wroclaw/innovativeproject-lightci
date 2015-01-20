'use strict';

var _ = require('lodash');
var db = require('../../models');
var run = require('../../components/run-script/run-script');
var builder = require("../../components/builder/builder");
var projectHandler = require("../../components/project-handling/project-handler");

// Get list of builds
exports.show = function(req, res) {
  db.Build.findAll({where: { ProjectId: req.query.project_id },order: 'build_date DESC'})
    .then(function(builds){
      res.json(builds);
    });
};

// Execute build
exports.create = function(req, res) {
  projectHandler.getConfigFromId(req.body.project_id, function(config) {
    builder.build(config);
  });
  res.json({"status":"ok"});
};

// Cancel build
exports.update = function(req, res) {
  db.Project.findAll({where: {id: req.body.project_id}})
    .then(function (proj) {
      if (proj.length == 0) {
        res.json({info: null, error: "No such project"});
      } else {
        run.cancel(_.first(proj));
        res.json({info: "Success!", error: null});
      }
    });
};
