'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of commits
exports.show = function(req, res) {
  db.findInstance('Build', {where: { id: req.query.build_id }})
    .then(function(build){
      build[0].getCommits().success(function(commits) {
        res.json(commits);
      });
    });
};
