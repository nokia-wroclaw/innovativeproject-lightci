'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of commits
exports.show = function(req, res) {
  db.findInstance('Commit', {where: { BuildId: req.query.build_id }})
    .then(function(commits){
      res.json(commits);
    });
};
