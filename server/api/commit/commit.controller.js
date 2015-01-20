'use strict';

var _ = require('lodash');
var db = require('../../models');

// Get list of commits
exports.show = function (req, res) {
  db.Build.find({where: {id: req.query.build_id}})
    .then(function (build) {
      if (!_.isEmpty(build)) {
        build.getCommits().success(function (commits) {
          res.json(commits);
        });
      } else res.json([]);
    });
};
