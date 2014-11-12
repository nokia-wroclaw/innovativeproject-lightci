/**
 * Created by ms on 29.10.14.
 */
var exec = require('child-process-promise').exec;

module.exports = {
  clone: function (repo_url, repo_cwd) {
    return gitClone(repo_url, repo_cwd);
  },
  pull: function (repo_cwd) {
   return gitPull(repo_cwd);
  },
  logLastCommit: function(repo_cwd){
    return gitLogLastCommit(repo_cwd);
  },
  logFull: function(repo_cwd,since){
    return gitLogFull(repo_cwd,since);
  }
};
function gitPull(repo_cwd) {
  return exec('cd ' + repo_cwd + ' && git pull origin master')
    .then(function (result) {
      return result;
  })
    .fail(function(err) {
      console.error("ERROR: ", err);
    });
}
function gitClone(repo_url, repo_cwd) {
  return exec('git clone ' + repo_url +' '+repo_cwd)
    .then(function (result) {
      return result;
    })
    .fail(function(err) {
      console.error("ERROR: ", err);
    });
}
function gitLogLastCommit(repo_cwd){
  return exec('cd ' + repo_cwd + ' && git --no-pager log -1 --pretty=format:"%H,%cn,%ce,%cd,%s" --date=local')
    .then(function (result) {
      var commit = result.stdout.split(',');
      return commit;
    })
    .fail(function(err) {
      console.error("ERROR: ", err);
    });
}
function gitLogFull(repo_cwd,since) {
  var date = new Date(since);
  return exec('cd ' + repo_cwd + ' && git --no-pager log --full-history --since="'+date.toString()+'" --pretty=format:"%H,%cn,%ce,%cd,%s" --date=local')
    .then(function (result) {
      if(result.stdout.length>0){
      var commits = result.stdout.split('\n');
      for (var i = 0; i < commits.length; ++i) {
        commits[i] = commits[i].split(',');
      }
        return commits;
      } else {
        console.log("Nothing to do");
      }
    })
    .fail(function(err) {
      console.error("ERROR: ", err);
    });
}
