/**
 * Created by ms on 16.12.14.
 */

var exec = require('child-process-promise').exec;
var db = require('../../models');

function deploy(project, i, build) {
  if (i < project.deploys.length) {
    console.log("[deploy "+i+"] " + project.projectName + " deploy in progress")
    var result = exec('sshpass -p \'' + project.deploys[i].serverPassword +
                      '\' scp repos/' + project.projectName + '/' + project.deploys[i].deployFilePath + ' ' +
                      project.deploys[i].serverUsername + '@' + project.deploys[i].serverAddress +
                      ':/home/' + project.deploys[i].serverUsername + '/');

    result = result.then(function () {
      return exec('sshpass -p \'' + project.deploys[i].serverPassword + '\' scp buildscripts/' + project.projectName +
                  '/'+project.deploys[i].scriptName + ' ' + project.deploys[i].serverUsername + '@' + project.deploys[i].serverAddress +
                  ':/home/' + project.deploys[i].serverUsername + '/');
    });

    result = result.then(function () {
      return exec('sshpass -p \'' + project.deploys[i].serverPassword + '\' ssh ' + project.deploys[i].serverUsername + '@' +
                  project.deploys[i].serverAddress + ' <<\'ENDSSH\' sh ./deploy.sh ENDSSH');
    });

    result.then(function (out) {
      console.log("[deploy "+i+"] success");
      addResultToDataBase('success', "n/a", project, build);
      deploy(project, i+1, build);
    }).fail(function (out) {
      console.log("[deploy "+i+"] fail " + out.stdout.message);
      addResultToDataBase('fail', out.stdout.message, project.deploys[i], build);
      deploy(project, i+1, build);
    });
  }
}

function addResultToDataBase(status,message,project,build){
 var newDeploy = db.Deploy.create({
   deploy_server: project.serverAddress,
   deploy_status: status,
   deploy_message: message
 });

  newDeploy.then(function(out){
    build.addDeploy([out]);
  });
}

module.exports = {
    deploy : deploy
};
