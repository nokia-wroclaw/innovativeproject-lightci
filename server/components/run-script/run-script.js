/**
 * Created by michal on 17.11.14.
 */
var exec = require('child-process-promise').exec;
var parser= require('../parsers/junitparser').junitParser;
function runBuildScript(projectName, scripts, build, db) {
  run(projectName, scripts, 0, db, build);
}

function run(projectName, scripts, i, db, build) {
  if (i==scripts.length){
    db.updateInstance(build, { build_ispending: false, build_issuccess: true });
  } else
  if (i < scripts.length) {
    exec('cd repos/' + projectName + ' && sh ../../buildscripts/' + projectName + '/' + scripts[i].scriptName)
      .then(function (result) {
        db.createInstance('BuildOutputs', {scriptName:scripts[i].scriptName,output: result.stdout,isSuccess:true}).then(function (out) {
          build.addBuildOutput([out]);
          parser(projectName,scripts[i],out,db);
        });
        run(projectName, scripts, i + 1, db, build);
      })
      .fail(function (err) {
        if (err.stdout) {
          db.createInstance('BuildOutputs', {scriptName:scripts[i].scriptName,output: err.stdout,isSuccess:false}).then(function (out) {
            build.addBuildOutput([out]);
            parser(projectName,scripts[i],out,db);
          }).then(function(){
            db.updateInstance(build, { build_ispending: false, build_issuccess: false });
          });

        }
      });
  }
}

exports.runBuildScript = runBuildScript;
