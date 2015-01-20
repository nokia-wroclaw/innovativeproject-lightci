/**
 * Created by michal on 24.11.14.
 */
var scm = require('../scm/scmManager');
var cronjobs = require("../cron-jobs/cron-jobs");
var exec = require('child-process-promise').exec;
var db = require('../../models');
var fs = require("fs");
var _ = require('lodash');
var backup = require('../config-backup/config-backup');

function projectExists(project) {
  var dbProject = db.Project.findAll({where: {project_name: project.projectName}});
  dbProject.then(function (projects) {
    if (projects.length == 0)
      return false;
    else
      return true;
  });
}

function addToConfig(project) {
  backup.configBackup("Add dashboard " + project.projectName);
  var projectsConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/projects.config.json"));
  var copy = projectsConfig["projects"].slice(0);
  copy.push(project);

  fs.writeFileSync(__dirname + "/../../config/projects.config.json", JSON.stringify({projects: copy}, undefined, 2));
}

function updateConfig(project_name, project) {
  backup.configBackup("Update dashboard " + project.projectName);

  var projectsConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/projects.config.json"));
  var copy = [];
  projectsConfig["projects"].forEach(function (element) {
    if (element.projectName == project_name)
      copy.push(project);
    else
      copy.push(element);
  });

  fs.writeFileSync(__dirname + "/../../config/projects.config.json", JSON.stringify({projects: copy}, undefined, 2));

  cronjobs.removeCrontabJob(project_name);
  if (project.useCrone)
    cronjobs.addCrontabJob(project);

}

function getConfigFromId(project_id, project_config) {
  var dbProject = db.Project.findAll({where: {id: project_id}});
  dbProject.then(function (projects) {
    if (projects.length == 0)
      project_config(null);
    else {
      var projectsConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/projects.config.json"));
      var callb = _.filter(projectsConfig['projects'], function (element) {
        return element.projectName == _.first(projects).project_name;
      });

      if (callb.length > 0)
        project_config(_.first(callb));
      else
        project_config(null);
    }
  });
}

function addProject(project) {
  try {
    scm.clone(project);
    if (project.useCrone)
      cronjobs.addCrontabJob(project);
  } catch (err) {
    console.log(err);
  }
}

function removeProject(project) {
  backup.configBackup("Remove dashboard " + project.projectName);

  var projectsConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/projects.config.json"));

  var copy = [];
  projectsConfig["projects"].forEach(function (element) {
    if (element["projectName"] != project.project_name)
      copy.push(element);
  });
  fs.writeFileSync(__dirname + "/../../config/projects.config.json", JSON.stringify({projects: copy}, undefined, 2));

  cronjobs.removeCrontabJob(project.project_name);

  if (fs.existsSync(__dirname + "/../../../buildscripts/" + project.project_name))
    exec("rm -r '" + __dirname + "/../../../buildscripts/" + project.project_name + "'", function () {
    });

  if (fs.existsSync(__dirname + "/../../../repos/" + project.project_name))
    exec("rm -r '" + __dirname + "/../../../repos/" + project.project_name + "'", function () {
    });

  project.destroy({ProjectId: project.project_id});
  console.log("Removing dashboard", project.project_name);
}

function updateProject(project) {
  try {
    scm.pull(project);
    if (project.useCrone)
      cronjobs.addCrontabJob(project);
  } catch (err) {
    console.log(err);
  }
}
module.exports = {
  addProject: addProject,
  updateProject: updateProject,
  projectExists: projectExists,
  removeProject: removeProject,
  getConfigFromId: getConfigFromId,
  updateConfig: updateConfig,
  addToConfig: addToConfig
};


