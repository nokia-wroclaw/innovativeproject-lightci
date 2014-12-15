'use strict';

var _ = require('lodash');
var projectHandler = require("../../components/project-handling/project-handler");
var fs = require("fs");

exports.show = function(req, res) {

  projectHandler.getConfigFromId(req.query.project_id,function(config) {
    if (config) {
      var scripts = config.scripts.slice(0);
      config.scripts = [];

      scripts.forEach(function(element) {
        if(fs.existsSync(__dirname+"/../../../buildscripts/"+config.projectName+"/"+element.scriptName)) {
          var content = fs.readFileSync(__dirname+"/../../../buildscripts/"+config.projectName+"/"+element.scriptName, "utf8");
          config.scripts.push({scriptContent: content, parser: element.parser, outputPath: element.outputPath});
        }
      });

      config.dependencies = config.dependencies.join(", ");

      res.json(config);
    }
    else {
      res.json(null);
    }
  });

};

exports.update = function(req, res) {
  var project = {

    projectName: req.body.project_name,
    repositoryUrl: req.body.project_url,
    repositoryType: req.body.project_repo,
    cronePattern: req.body.project_pattern,
    repositoryUsername: req.body.project_username,
    repositoryPassword: req.body.project_password,
    strategy: req.body.strategy,
    useCrone: req.body.project_usecrone,
    dependencies: [],
    scripts: []

  };

  //console.log(req);
  if(!fs.existsSync(__dirname+"/../../../buildscripts/"+project.projectName))
    fs.mkdirSync(__dirname+"/../../../buildscripts/"+project.projectName);

  for(var i = 0; i< req.body.scripts.length; i++) {
    fs.writeFileSync(__dirname+"/../../../buildscripts/"+project.projectName+"/"+ i.toString()+".sh", req.body.scripts[i].scriptContent);
    project.scripts.push({ scriptName: i.toString()+".sh", parser: req.body.scripts[i].parser, outputPath: req.body.scripts[i].outputPath });
  }

  project.dependencies = (req.body.project_dependencies.replace( /\s/g, "").split(","));

  if(req.body.project_dependencies)
    project.dependencies = (req.body.project_dependencies.replace(/\s/g, "").split(","));
  else
    project.dependencies = [];

  projectHandler.updateConfig(project.projectName, project);

  res.json({info: "Nice", error: null});
};
