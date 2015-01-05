/**
 * Created by ms on 29.11.14.
 */

var exec = require('child-process-promise').exec;
var fs = require("fs");
var db;
function clone(project){
  var scm = require('./'+project.repositoryType+'/'+project.repositoryType)(db);
  scm.clone(project);
}

function pull (project){
  var scm = require('./'+project.repositoryType+'/'+project.repositoryType)(db);

  if(project.strategy == "pull")
    scm.pull(project);
  else if(project.strategy == "clone") {
    scm.cloneAgain(project);
  } else
  {
    console.log("Unknown update strategy");
  }
}

module.exports = function(models){
  db = models;
  return {
    pull : pull,
    clone : clone
  };
};

