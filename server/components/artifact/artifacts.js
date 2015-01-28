/**
 * Created by ms on 21.01.15.
 */

var exec = require('child-process-promise').exec;
var db = require('../../models');
var fs = require('fs');
module.exports = {
  createArtifact: createArtifact
};

function createArtifact(project, build) {
  var date = new Date();
  var fileName = project.projectName + '-' + date.getTime() + '.zip';

  if (!fs.existsSync(__dirname + "/../../../artifacts/" + project.projectName))
    fs.mkdirSync(__dirname+"/../../../artifacts/" + project.projectName);

  var result = exec('cp repos/'+project.projectName+'/'+project.artifactFilePath + ' artifacts/'+project.projectName+'/'+fileName);

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

