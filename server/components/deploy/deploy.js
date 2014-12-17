/**
 * Created by ms on 16.12.14.
 */

var exec = require('child-process-promise').exec;
var db = require('../db/db');

function deploy(project,build){
  var result = exec('sshpass -p \''+project.serverPassword+'\' scp repos/'+project.projectName+'/'+project.deployFilePath+' ' + project.serverUsername+'@'+project.serverAddress+':/home/'+project.serverUsername+'/');

  result = result.then(function(){
    return exec('sshpass -p \''+project.serverPassword+'\' scp buildscripts/'+project.projectName+'/deploy.sh '  + project.serverUsername+'@'+project.serverAddress+':/home/'+project.serverUsername+'/');
  });

  result = result.then(function(){
   return exec('sshpass -p \''+project.serverPassword+'\' ssh '+project.serverUsername+'@'+project.serverAddress+' <<\'ENDSSH\' sh ./deploy.sh ENDSSH');
  });

  result.then(function(out){
    console.log("success");
    addResultToDataBase('success',"n/a",project,build);
  }).fail(function(out){
    console.log(out.stdout.message);
    addResultToDataBase('fail',out.stdout.message,project,build);
  });

}

function addResultToDataBase(status,message,project,build){
 var newDeploy = db.createInstance('Deploys', {
   deploy_server: project.serverAddress,
   deploy_status: status,
   deploy_message: message
 });

  newDeploy.then(function(out){
    build.addDeploy([out]);
  });
}
exports.deploy = deploy;
