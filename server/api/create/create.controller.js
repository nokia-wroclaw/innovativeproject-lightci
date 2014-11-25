'use strict';

var _ = require('lodash');
var projectHandler = require("../../components/project-handling/project-handler");
var fs = require("fs");

// Get list of creates
exports.create = function(req,res) {
  var project = {
    projectName: req.body.project_name,
    repositoryUrl: req.body.project_url,
    repositoryType: req.body.project_repo,
    cronePattern: req.body.project_pattern,
    scripts: req.body.scripts
  };

  projectHandler.projectExists(project, function(exists) {
    if(!exists) {
      projectHandler.addProject(project);

      var projectsConfig = JSON.parse(fs.readFileSync("server/config/projects.config.json"));
      var copy = projectsConfig["projects"].slice(0);
      copy.push(project);

      fs.writeFileSync("server/config/projects.config.json", JSON.stringify({ projects: copy }));

      res.json({ info: "Success (I guess)!", error: null});
    } else {
      res.json({ info: null, error: "Project already exists"});
    }
  });


};
