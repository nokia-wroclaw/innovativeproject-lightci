/* get revision number using svn command info */
function getRevision(svn, callback) {
	svn.info('', function(err, info) {
		callback.call(info[Object.keys(info)[6]]);	
	});
}

/* get commit list using svn command log (revisions from [revision] to HEAD)
	param revision: revision you want to start log
*/
function getCommits(svn, revision, callback)	{
	svn.log('-r '+revision+':HEAD', function(err,info) {
		if(err) { callback("Error: log\n"+err, null); } else {
			// construct array of commits
			var arr = [];
			for(i in info) {
				arr.push({revision: info[i]['revision'],
					author: info[i]['author'],
					date: info[i]['date'],
					message: info[i]['message']});
			}
			callback(null, arr);
		}
	});	
}

/* get commit list from update command */
function getCommitsFromUpdate(svn, callback) {
	getRevision(svn, function() {
		revision = (parseInt(this.toString())+1);		
		svn.up('', function(err, info) {
			if(err) callback("Error: update\n"+err, null);	
			else {
				if(info[0])
					getCommits(svn, revision, function(err, info) { callback(err,info); });
				else
					callback(null, []);
			}	
		});
	});
}

/*	checkout or update repo
		params:
			repo_url 	- url of svn repository
			repo_cwd 	- working directory
			repo_user	- user name for repository
			repo_pass	- password for repository

		returns an error or array of commit objects
*/
function checkSVN(repo_url, repo_cwd, repo_user, repo_pass, callback) {

	var fs = require('fs');
	var action = '';

	// if repo_cwd directory exists, update repository. Otherwise, checkout with this cwd.
	if(fs.existsSync(repo_cwd)) action = 'update';
	else action = 'checkout';

	// SVN object
	var SVN = require('node.svn');
	var svn = new SVN({
		cwd:		repo_cwd,
		username:	repo_user,
		password:	repo_pass });

	if(action === 'checkout') {
		svn.co(repo_url, function(err, info) {
			if(callback) {
				if(err) callback("Error: checkout\n"+err, null);	
				else getCommits(svn, 'HEAD', function(err, info) { callback(err,info); });
			}
		});
	}

	if(action === 'update') {
		getCommitsFromUpdate(svn, function(err, info) {
			if(callback) {
				if(err) callback(err, null)
				else callback(null, info);
			}
		});
	}

}

exports.checkSVN = checkSVN;
