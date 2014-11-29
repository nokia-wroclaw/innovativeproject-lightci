/**
 * Created by ms on 29.11.14.
 */

function clone(project){
  var scm = require('./'+project.repositoryType+'/'+project.repositoryType);
  scm.clone(project);
}

function pull (project){
  var scm = require('./'+project.repositoryType+'/'+project.repositoryType);
  scm.pull(project);
}

exports.pull = pull;
exports.clone = clone;
