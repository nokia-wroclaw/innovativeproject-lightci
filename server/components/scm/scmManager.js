/**
 * Created by ms on 29.11.14.
 */

var exec = require('child-process-promise').exec;
var fs = require("fs");
var db = require('../../models');

function clone(project) {
  var scm = require('./' + project.repositoryType + '/' + project.repositoryType);
  scm.clone(project);
}

function pull(project) {
  var scm = require('./' + project.repositoryType + '/' + project.repositoryType);

  if (project.strategy == "pull")
    scm.pull(project);
  else if (project.strategy == "clone") {
    scm.cloneAgain(project);
  } else {
    console.log("Unknown update strategy");
  }
}

module.exports = {
  pull: pull,
  clone: clone
};

