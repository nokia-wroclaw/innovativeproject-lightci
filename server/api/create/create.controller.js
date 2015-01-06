'use strict';

var _ = require('lodash');

var fs = require("fs");

// Get list of creates
exports.create = function (req, res) {
  var db =req.db;
  var projectHandler = require("../../components/project-handling/project-handler")(db);

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


    if (!fs.existsSync(__dirname + "/../../../../../buildscripts/" + project.projectName))
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
