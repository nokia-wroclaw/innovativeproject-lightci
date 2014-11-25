'use strict';

var _ = require('lodash');
var projectHandler = require("../../components/project-handling/project-handler");
var fs = require("fs");

exports.show = function(req, res) {

  projectHandler.getConfigFromId(req.body.project_id,function(config) {
    if (config) {
      res.json(config);
    }
    else
      res.json(null);
  });
};

exports.update = function(req, res) {
  var project = {
    projectName: req.body.project_name,
    repositoryUrl: req.body.project_url,
    repositoryType: req.body.project_repo,
    cronePattern: req.body.project_pattern,
    scripts: [] //req.body.project_scripts
  };

  projectHandler.updateConfig(req.body.project_name, project);

  fs.writeFileSync("server/config/projects.config.json", JSON.stringify({ projects: copy }));
  res.json({info: "Nice", error: null});
};
