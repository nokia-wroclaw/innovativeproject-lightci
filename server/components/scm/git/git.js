/**
 * Created by ms on 29.10.14.
 */

var clone = require("nodegit").Repo.clone;
var open = require("nodegit").Repo.open;
var db = require('./../../db/db');
var exec = require('child_process').exec;

module.exports = {
  clone: function (repo_url, repo_cwd) {
    gitClone(repo_url, repo_cwd);
  },
  pull: function (repo_cwd) {
    gitPull(repo_cwd);
  }
};
function gitPull(repo_cwd){
  exec('cd '+repo_cwd+' && git pull origin master', function (error, stdout, stderr){
    console.log(stdout);
    //process.stderr.write(err);
    //process.stdout.write(out);
    getInfo(repo_cwd);
  });
}
function gitClone(repo_url, repo_cwd){
  clone(repo_url, repo_cwd, null,function(repo){
  getInfo(repo_cwd);

  });
}
function getInfo(repo_cwd){
  open(repo_cwd,function(error,repo) {
    repo.getMaster(function(error,master){
      var history = master.history();
      history.on("commit", function(commit) {
        var dbProject = db.findInstance('Commit', {where: {commit_id: commit.sha(),commit_author:commit.author().name(),commit_date:commit.date(),commit_comment:commit.message()}});
        dbProject.then(function(commits){
          if(commits.length==0) {
            db.createInstance('Commit', {
              "revision": commit.sha(),
              "date": commit.date(),
              "author": commit.author().name(),
              "message": commit.message()
            });
          }
        });
      });
      history.start();
    //});
  });
});
}


