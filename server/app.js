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
var db = require('./components/db/db');
var projHandler = require("./components/project-handling/project-handler.js")

var fs = require("fs");
var builder = require("./components/builder/builder.js");

var exec = require('child-process-promise').exec;
// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Read the app's config file
var globalConfigs = require("./config/global.config.json");

// Read the projects' config file
var projectConfigs = require("./config/projects.config.json");


// Create the directory path for the project
var projectDir = globalConfigs['checkoutDir'];

// A map with crontab jobId's for every running project
global.jobsMap = {};

var socketServer = require("http").createServer(app);
var io = require("socket.io")(socketServer);
socketServer.listen(3000);

global.webSockets = io.sockets;
io.on('connection', function(socket) {
  global.webSockets = io.sockets;
});

// Prepare database tables if not existing
db.createTables(globalConfigs['databaseDir'], function () {
  // Check the repo
  projectConfigs['projects'].forEach(function (project) {
    var dbProject = db.findInstance('Project', {where: {project_name: project.projectName}});
    dbProject.then(function (projects) {
      if (projects.length == 0) {
        projHandler.addProject(project)
      } else
        projHandler.updateProject(project);
    });
  });

  //clean builds with pending status
  builder.cleanPendingBuilds();
});




// Expose app
exports = module.exports = app;
