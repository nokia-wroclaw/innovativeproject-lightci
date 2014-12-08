'use strict';
var _ = require('lodash');
var builder = require("../../components/builder/builder");
var projectHandler = require("../../components/project-handling/project-handler");

// Execute build
exports.create = function(req, res) {

  projectHandler.getConfigFromId(req.body.project_id, function(config) {
    builder.build(config);
  });
  res.json({"status":"ok"});
};
