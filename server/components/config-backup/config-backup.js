/**
 * Created by ms on 13.01.15.
 */

var db = require('../../models');
var exec = require('child-process-promise').exec;
var projectHandler = require('../project-handling/project-handler.js');
var _ = require('lodash');

module.exports = {
  configBackup: configBackup,
  restoreConfig: restoreConfig
};

function configBackup(operation) {
  var date = new Date();
  var copyPromise = exec('cp ' + __dirname + '/../../config/projects.config.json ' + __dirname + "/../../../config_backups/config_" + date.getTime() + '.json');

  return copyPromise.then(function () {
    return addToDataBase(operation, date);
  }).fail(function (err) {
    console.log(err);
  });
};

function restoreConfig(configId) {
  db.ConfigLog.findAll({where: {id: configId}}).then(function(conf) {
    var dbConfig = _.first(conf);
    if(dbConfig) {
      configBackup("Restore config "+dbConfig.file_name);
      var movePromise = exec('mv ' + __dirname + '/../../../config_backups/config_' + dbConfig.file_name+'.json '+ __dirname + '/../../config/projects.config.json ');

      return movePromise.then(function() {
        projectHandler.syncProjects();
        return dbConfig;
      }).fail(function (err) {
          console.log(err);
        }
      )
    }
  });
}

function addToDataBase(operation, date) {
  return db.ConfigLog.create({
    date: date,
    before_operation: operation,
    file_name: date.getTime()
  });
}
