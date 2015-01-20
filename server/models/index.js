/**
 * Created by ms on 21.12.14.
 */

'use strict';
var fs        = require("fs");
var path      = require("path");
var Sequelize = require('sequelize');
var globalConfigs = require("../config/global.config.json");
var db        = {};

// initialize database connection
var sequelize = new Sequelize('lightci_db', 'root', 'root', {
  dialect: "sqlite",
  port: 3306,
  storage: globalConfigs.databaseDir,
  logging: false
});

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;

module.exports = db;
