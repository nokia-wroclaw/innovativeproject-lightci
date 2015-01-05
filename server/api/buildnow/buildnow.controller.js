'use strict';
var _ = require('lodash');


// Execute build
exports.create = function(req, res) {
  var run = require('../../components/run-script/run-script')(req.db);
  var builder = require("../../components/builder/builder")(req.db,run);
  var projectHandler = require("../../components/project-handling/project-handler")(req.db);
  projectHandler.getConfigFromId(req.body.project_id, function(config) {
    builder.build(config);
  });
  res.json({"status":"ok"});
};
