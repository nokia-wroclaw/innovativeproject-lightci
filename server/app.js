/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Our modules
var svn = require('./components/scm/svn/svn');
var git = require('./components/scm/git/git');
var db = require('./components/db/db');
var crontab = require('node-crontab');

// Start server
server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Read the app's config file
var globalConfigs = require("./config/global.config.json");

// Prepare database tables if not existing
db.createTables(globalConfigs['databaseDir']);

// Read the projects' config file
var projectConfigs = require("./config/projects.config.json");

// Get only first entry (for testing)
/*var repoUrl = projectConfigs['projects'][0]['repositoryUrl'];
var repoType = projectConfigs['projects'][0]['repositoryType'];
var projectName = projectConfigs['projects'][0]['projectName'];*/

// Create the directory path for the project
var projectDir = globalConfigs['checkoutDir'];

// callback after SVN module checkout/update
function svnCallback(err, info) {
  if (!err) {
    // project has some new commits - save commits to database
    if ( info.length > 0 ) {
      for (var c=0; c<info.length; c++) {
	db.createInstance('Commit', info[c]);
      }
      // and save build with new version (change date to current datetime!)
      db.createInstance('Build', { revision: info[info.length-1]['revision'], date: info[info.length-1]['date'] });   
    }
  }
}

// Check the repo
projectConfigs['projects'].forEach(function(project){
  if(project.repositoryType === 'svn'){
    
    var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
    dbProject.then(function(projects){
      if(projects.length==0){
        svn.checkout(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', svnCallback);
        db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName});

      }else{
        svn.update(project.repositoryUrl, projectDir + "/" + project.projectName, '', '', svnCallback);
      }
      var jobId = crontab.scheduleJob(project.cronePattern, function(url, cwd){
        svn.update(url, cwd, '', '', svnCallback);
      }, [project.repositoryUrl, projectDir+"/"+project.projectName]);
    });
  } else if ( project.repositoryType === 'git' ) {

    var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
    dbProject.then(function(projects){
      if(projects.length==0){
        git.clone(project.repositoryUrl, projectDir + "/" + project.projectName);
        db.createInstance('Project', {url: project.repositoryUrl, name: project.projectName});

      }else{
        git.pull(projectDir+"/"+project.projectName);
      }
      var jobId = crontab.scheduleJob(project.cronePattern, function(cwd){
        git.pull(cwd);
      }, [projectDir+"/"+project.projectName]);
    });
  }
  else {
    console.log("Unsupported repository: "+repoType);
  }
});



// Expose app
exports = module.exports = app;
