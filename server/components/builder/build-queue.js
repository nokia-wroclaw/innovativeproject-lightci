/**
 * Created by ms on 14.01.15.
 */
var _ = require('lodash');
var websocket = require('../websocket/websocket');

var buildQueue = [];
var currentBuilding = [];
var maxBuildingProjects = require('../../config/global.config.json').maxBuildingProjects;
var Q = require("q");

module.exports = {
    buildQueue:buildQueue,
    currentBuilding:currentBuilding,
    maxBuildingProjects:maxBuildingProjects,
    addToBuildQueue:addToBuildQueue,
    getProjectsToBuild:getProjectsToBuild,
    removeFinished:removeFinished
};

function addToBuildQueue(project){
  var foundProject = _.find(buildQueue,function(proj){
    return proj.projectName === project.projectName;
  });
  if(_.isUndefined(foundProject)){
    buildQueue.push(project);
    websocket.sendBuildQueueChange('add',project.projectName);
  }
}


function getProjectsToBuild() {
  var n = maxBuildingProjects - currentBuilding.length;
  var currentAdded = [];
  var deferred = Q.defer();

  for (var i=0; i<n; i++){
    if(buildQueue.length>0) {
      var currentProject = buildQueue.pop();
      websocket.sendBuildQueueChange('remove',currentProject.projectName);
      currentAdded.push(currentProject);
      currentBuilding.push(currentProject);
    }
  }

  deferred.resolve(currentAdded);

  return deferred.promise;
}

function removeFinished(project){
  var deferred = Q.defer();

  currentBuilding = _.filter(currentBuilding,function(proj){
    return project.projectName !== proj.projectName;
  });
  deferred.resolve(currentBuilding);

  return deferred.promise;
};
