'use strict';

var _ = require('lodash');

var fs = require("fs");
var db = require('../../models');
var projectHandler = require("../../components/project-handling/project-handler");

// Get project
exports.create = function (req, res) {

  var project = {
    projectName: req.body.project_name,
    repositoryUrl: req.body.project_url,
    repositoryType: req.body.project_repo,
    strategy: req.body.project_strategy,
    cronePattern: req.body.project_pattern,
    repositoryUsername: req.body.project_username || "",
    repositoryPassword: req.body.project_password || "",
    useCrone: req.body.project_usecrone,
    useDeployServer: req.body.project_usedeploy,
    serverUsername: req.body.project_serverusername,
    serverPassword: req.body.project_serverpassword,
    serverAddress: req.body.project_serveraddress,
    deployFilePath: req.body.project_filepath,
    createArtifact: req.body.project_artifact,
    artifactFilePath: req.body.project_artifactpath,
    dependencies: [],
    scripts: []
  };

  if (req.body.project_dependencies)
    project.dependencies = (req.body.project_dependencies.replace(/\s/g, "").split(","));
  else
    project.dependencies = [];

  var err = "";

  if (!project.projectName) {
    err = "Project name is empty";
  } else if (!project.repositoryUrl) {
    err = "Repository URL is empty";
  } else if (projectHandler.projectExists(project)) {
    err = "Project already exists";
  } else if(/[^a-zA-Z0-9_]/.test(project.projectName)) {
    err = "Project name can only contain letters, digits and underscore";
  }

  if (err) {
    res.json({info: null, error: err});
  } else {


    if (!fs.existsSync(__dirname + "/../../../buildscripts/" + project.projectName))
      fs.mkdirSync(__dirname + "/../../../buildscripts/" + project.projectName);

    fs.writeFileSync(__dirname + "/../../../buildscripts/" + project.projectName + "/deploy.sh", req.body.project_serverscript);

    for (var i = 0; i < req.body.scripts.length; i++) {
      fs.writeFileSync(__dirname + "/../../../buildscripts/" + project.projectName + "/" + i.toString() + ".sh", req.body.scripts[i].scriptContent);
      project.scripts.push({
        scriptName: i.toString() + ".sh",
        parser: req.body.scripts[i].parser,
        outputPath: req.body.scripts[i].outputPath
      });
    }
    projectHandler.addProject(project);
    projectHandler.addToConfig(project);
    res.json({info: "Success (I guess)!", error: null});

  }

};

exports.show = function(req, res) {

  projectHandler.getConfigFromId(req.query.project_id,function(config) {
    if (config) {
      var scripts = config.scripts.slice(0);
      config.scripts = [];

      if(fs.existsSync(__dirname+"/../../../buildscripts/"+config.projectName+"/deploy.sh"))
        config.serverScript = fs.readFileSync(__dirname+"/../../../buildscripts/"+config.projectName+"/deploy.sh", "utf8");

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
    strategy: req.body.project_strategy,
    useCrone: req.body.project_usecrone,
    useDeployServer: req.body.project_usedeploy,
    serverUsername: req.body.project_serverusername,
    serverPassword: req.body.project_serverpassword,
    serverAddress: req.body.project_serveraddress,
    deployFilePath: req.body.project_filepath,
    createArtifact: req.body.project_artifact,
    artifactFilePath: req.body.project_artifactpath,
    dependencies: [],
    scripts: []

  };

  var err = "";

  if (!project.repositoryUrl) {
    err = "Repository URL is empty";
  }

  if (err) {
    res.json({info: null, error: err});
  } else {

    //console.log(req);
    if (!fs.existsSync(__dirname + "/../../../buildscripts/" + project.projectName))
      fs.mkdirSync(__dirname + "/../../../buildscripts/" + project.projectName);

    fs.writeFileSync(__dirname + "/../../../buildscripts/" + project.projectName + "/deploy.sh", req.body.project_serverscript);

    for (var i = 0; i < req.body.scripts.length; i++) {
      fs.writeFileSync(__dirname + "/../../../buildscripts/" + project.projectName + "/" + i.toString() + ".sh", req.body.scripts[i].scriptContent);
      project.scripts.push({
        scriptName: i.toString() + ".sh",
        parser: req.body.scripts[i].parser,
        outputPath: req.body.scripts[i].outputPath
      });
    }

    project.dependencies = (req.body.project_dependencies.replace(/\s/g, "").split(","));

    if (req.body.project_dependencies)
      project.dependencies = (req.body.project_dependencies.replace(/\s/g, "").split(","));
    else
      project.dependencies = [];

    projectHandler.updateConfig(project.projectName, project);

    res.json({info: "Nice", error: null});
  }
};
