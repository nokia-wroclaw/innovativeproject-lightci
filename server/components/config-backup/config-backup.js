/**
 * Created by ms on 13.01.15.
 */

var db = require('../../models');
var exec = require('child-process-promise').exec;

module.exports = {
  configBackup: configBackup
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

function addToDataBase(operation, date) {
  return db.ConfigLog.create({
    date: date,
    before_operation: operation,
    file_name: date.getTime()
  });
};
