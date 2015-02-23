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


// A map with crontab jobId's for every running dashboard
global.jobsMap = {};

var socketServer = require("http").createServer(app);
var io = require("socket.io")(socketServer);
socketServer.listen(3000);

global.webSockets = io.sockets;
io.on('connection', function(socket) {
  global.webSockets = io.sockets;
});

models.sequelize.sync().then(function(){
  //synchronize projects and db with config
  projHandler.syncProjects();

  //clean builds with pending status
  builder.cleanPendingBuilds();
});

// create directories if not existing
if (!fs.existsSync(__dirname + "/../buildscripts"))
  fs.mkdirSync(__dirname+"/../buildscripts");
if (!fs.existsSync(__dirname + "/../repos"))
  fs.mkdirSync(__dirname+"/../repos");
if (!fs.existsSync(__dirname + "/../config_backups"))
  fs.mkdirSync(__dirname+"/../config_backups");
if (!fs.existsSync(__dirname + "/../artifacts"))
  fs.mkdirSync(__dirname+"/../artifacts");

// create config if not existing
if(!fs.existsSync(__dirname + "/config/projects.config.json")) {
  var new_config = { projects: [] };
  fs.writeFileSync(__dirname + "/config/projects.config.json", JSON.stringify(new_config, undefined, 2));
}


// Expose app
module.exports = app;
