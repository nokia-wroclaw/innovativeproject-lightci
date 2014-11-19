/**
 * Created by michal on 17.11.14.
 */
var exec = require('child-process-promise').exec;

function runBuildScript(projectName, scripts, build, db) {
  run(projectName, scripts, 0, db, build);
}

function run(projectName, scripts, i, db, build) {
  if (i==scripts.length){
    db.updateInstance(build, { build_ispending: false, build_issuccess: true });
  } else
  if (i < scripts.length) {
    console.log("executing script: " + i);
    exec('cd repos/' + projectName + ' && sh ../../buildscripts/' + projectName + '/' + scripts[i])
      .then(function (result) {
        console.log(result.stdout);
        db.createInstance('BuildOutputs', {scriptName:scripts[i],output: result.stdout}).then(function (out) {
          build.addBuildOutput([out]);
        });
        run(projectName, scripts, i + 1, db, build);

      })
      .fail(function (err) {
        if (err.stdout) {
          console.log("[BUILD ERROR]\n" + err);
          console.log("[BUILD OUTPUT]\n" + err.stdout);
          console.log("build id: "+build.id);
          db.createInstance('BuildOutputs', {scriptName:scripts[i],output: err.stdout}).then(function (out) {

            build.addBuildOutput([out]);
          }).then(function(){
            db.updateInstance(build, { build_ispending: false, build_issuccess: false });
          });

        }
      });
  }
}

exports.runBuildScript = runBuildScript;
