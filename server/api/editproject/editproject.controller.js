'use strict';

var _ = require('lodash');
var projectHandler = require("../../components/project-handling/project-handler");
var fs = require("fs");

exports.show = function(req, res) {
  projectHandler.getConfigFromId(req.query.project_id,function(config) {
    if (config) {
      res.json(config);
    }
    else {
      res.json(null);
    }
  });

};

exports.update = function(req, res) {
  var project = {
    projectName: req.query.project_name,
    repositoryUrl: req.query.project_url,
    repositoryType: req.query.project_repo,
    cronePattern: req.query.project_pattern,
    scripts: req.query.scripts
  };

  projectHandler.updateConfig(req.query.project_name, project);

  res.json({info: "Nice", error: null});
};
