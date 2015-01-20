'use strict';

var _ = require('lodash');
var buildQueue = require('../../components/builder/build-queue');
// Get list of buildQueues
exports.index = function(req, res) {
  var projects = _.map(buildQueue.buildQueue,function(project){
    return project.projectName;
  });
  res.json(projects);
};
