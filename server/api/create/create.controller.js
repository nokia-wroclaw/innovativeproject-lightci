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
    repositoryUsername: req.body.project_username,
    repositoryPassword: req.body.project_password,
    useCrone: req.body.project_usecrone,
    dependencies: [],
    scripts: []
  };

  //console.log(project);

  if(!fs.existsSync(__dirname+"/../../../../../buildscripts/"+project.projectName))
    fs.mkdirSync(__dirname+"/../../../buildscripts/"+project.projectName);

  for(var i = 0; i< req.body.scripts.length; i++) {
    fs.writeFileSync(__dirname+"/../../../buildscripts/"+project.projectName+"/"+ i.toString()+".sh", req.body.scripts[i].scriptContent);
    project.scripts.push({ scriptName: i.toString()+".sh", parser: req.body.scripts[i].parser, outputPath: req.body.scripts[i].outputPath });
  }

  project.dependencies = (req.body.project_dependencies.replace( /\s/g, "").split(","));

  projectHandler.projectExists(project, function(exists) {
    if(!exists) {
      projectHandler.addProject(project);

      projectHandler.addToConfig(project);

      res.json({ info: "Success (I guess)!", error: null});
    } else {
      res.json({ info: null, error: "Project already exists"});
    }
  });


};
