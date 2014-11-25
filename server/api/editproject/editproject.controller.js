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
        if(fs.existsSync("buildscripts/"+config.projectName+"/"+element.scriptName)) {
          var content = fs.readFileSync("buildscripts/"+config.projectName+"/"+element.scriptName, "utf8");
          config.scripts.push({scriptContent: content, parser: element.parser, outputPath: element.outputPath});
        }
      });

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
    scripts: []

  };

  if(!fs.existsSync("buildscripts/"+project.projectName))
    fs.mkdirSync("buildscripts/"+project.projectName);

  for(var i = 0; i< req.query.scripts.length; i++) {
    fs.writeFileSync("buildscripts/"+project.projectName+"/"+ i.toString()+".sh", req.query.scripts[i].scriptContent);
    project.scripts.push({ scriptName: i.toString()+".sh", parser: req.query.scripts[i].parser, outputPath: "" });
  }

  projectHandler.updateConfig(req.query.project_name, project);

  res.json({info: "Nice", error: null});
};
