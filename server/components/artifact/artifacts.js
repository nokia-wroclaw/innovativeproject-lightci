/**
 * Created by ms on 21.01.15.
 */

var exec = require('child-process-promise').exec;
var db = require('../../models');
var fs = require('fs');
var path = require('path');
module.exports = {
  createArtifacts: createArtifacts
};

function createArtifacts(project, build) {
  var date = new Date();
  var i = 0;

  if (!fs.existsSync(__dirname + "/../../../artifacts/" + project.projectName))
    fs.mkdirSync(__dirname+"/../../../artifacts/" + project.projectName);

  project.artifacts.forEach(function(filePath) {
    i++;
    createArtifact(project, date, filePath, i, build);
  });
}

function createArtifact(project, date, filePath, i, build) {
  var fileName = project.projectName + '-' + i + '-' + date.getTime() + path.extname(filePath);
  var result = exec('cp repos/'+project.projectName+'/'+filePath + ' artifacts/'+project.projectName+'/'+fileName);

  result.then(function(){
    var newArtifact = db.Artifact.create({
      file_name:fileName,
      date:date
    });

    newArtifact.then(function(out){
      build.addArtifact([out]);
    });
  });
}

