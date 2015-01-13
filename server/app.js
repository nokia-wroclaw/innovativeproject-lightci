/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
var flash    = require('connect-flash');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var models = require('./models');
// Setup server
var app = express();
var server = require('http').createServer(app);

global.passport = require('passport');
app.set('models', require('./models'));

app.use(cookieParser());
app.use(session({ secret: 'sessionsecret' })); // session secret
app.use((global.passport).initialize());
app.use((global.passport).session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./config/express')(app);
require('./routes')(app);

// Our modules
var projHandler = require("./components/project-handling/project-handler.js");

var fs = require("fs");
var run = require("./components/run-script/run-script.js");
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

models.sequelize.sync().then(function(){
  var Project = models.Project;

  projectConfigs['projects'].forEach(function (project) {
    var dbProject = Project.findAll({where: {project_name: project.projectName}});
    dbProject.then(function (projects) {
      if (projects.length == 0) {
        projHandler.addProject(project);
      } else
        projHandler.updateProject(project);
    });
  });

//clean builds with pending status
  builder.cleanPendingBuilds();
});


// Expose app
module.exports = app;
