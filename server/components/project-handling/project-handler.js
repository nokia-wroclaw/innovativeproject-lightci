/**
 * Created by michal on 24.11.14.
 */
var scm = require('../scm/scmManager');
var cronjobs = require("../cron-jobs/cron-jobs");
var db = require('../db/db');
var fs = require("fs");

function projectExists(project, exists)
{
  var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
  dbProject.then(function (projects) {
    if(projects.length == 0)
      exists(false);
    else
      exists(true);
  });
}

function addToConfig(project) {
  var projectsConfig = JSON.parse(fs.readFileSync("server/config/projects.config.json"));
  var copy = projectsConfig["projects"].slice(0);
  copy.push(project);

  fs.writeFileSync("server/config/projects.config.json", JSON.stringify({ projects: copy }, undefined, 2));
}

function updateConfig(project_name, project) {
  var projectsConfig = JSON.parse(fs.readFileSync("server/config/projects.config.json"));
  var copy = [];
  projectsConfig["projects"].forEach(function(element) {
    if(element.projectName == project_name)
      copy.push(project);
    else
      copy.push(element);
  });

  fs.writeFileSync("server/config/projects.config.json", JSON.stringify({ projects: copy }, undefined, 2));

  cronjobs.removeCrontabJob(project_name);
  cronjobs.addCrontabJob(project);

}

function getConfigFromId(project_id, project_config)
{
  var dbProject = db.findInstance('Project', {where: {id: project_id}});
  dbProject.then(function (projects) {
    if(projects.length == 0)
      project_config(null);
    else
    {
      var projectsConfig = JSON.parse(fs.readFileSync("server/config/projects.config.json"));
      var callb;
      projectsConfig['projects'].forEach(function(element) {
        if (element.projectName === projects[0].project_name)
          callb = element;
      });
      if(callb) project_config(callb);
      else project_config(null);
    }
  });
}

function addProject(project)
{
  try {
    scm.clone(project);
    cronjobs.addCrontabJob(project);
  } catch(err){
    console.log("Unsupported repository: " + project.repositoryType);
  }
}

function removeProject(project) {
  var projectsConfig = JSON.parse(fs.readFileSync("server/config/projects.config.json"));

  var copy = [];
  projectsConfig["projects"].forEach(function(element) {
    if(element["projectName"] != project.project_name)
      copy.push(element);
  });
  fs.writeFileSync("server/config/projects.config.json", JSON.stringify({ projects: copy }, undefined, 2));

  cronjobs.removeCrontabJob(project.project_name);
  db.deleteInstance(project, {ProjectId: project.project_id});
  console.log("Removing project", project.project_name);
}

function updateProject(project){
  try {
    scm.pull(project);
    cronjobs.addCrontabJob(project);
  } catch(err){
    console.log("Unsupported repository: " + project.repositoryType);
    console.log(err);
  }
}

exports.addProject = addProject;
exports.updateProject = updateProject;
exports.projectExists = projectExists;
exports.removeProject = removeProject;
exports.getConfigFromId = getConfigFromId;
exports.updateConfig = updateConfig;
exports.addToConfig = addToConfig;
