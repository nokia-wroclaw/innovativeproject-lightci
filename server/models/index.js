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
  logging: true,
  dialectOptions: {
    charset: 'utf8'
  }
});

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    module.exports[model.name] = model;
  });

Object.keys(module.exports).forEach(function(modelName) {
  if ("associate" in module.exports[modelName]) {
    module.exports[modelName].associate(module.exports);
  }
});


module.exports.sequelize = sequelize;
