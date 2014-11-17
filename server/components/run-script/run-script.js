/**
 * Created by michal on 17.11.14.
 */
var exec = require('child-process-promise').exec;

function runBuildScript(projectName){
  console.log("Running build script for: ", projectName);
  return exec('cd repos/'+projectName+' && sh ../../buildscripts/'+projectName+'.sh')
    .then(function (result) {
      console.log("[BUILD]: "+result.stdout);
      return result;
    })

}

exports.runBuildScript = runBuildScript;
