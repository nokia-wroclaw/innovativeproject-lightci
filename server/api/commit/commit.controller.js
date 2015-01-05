'use strict';

var _ = require('lodash');


// Get list of commits
exports.show = function (req, res) {
  var db = req.db;

  db.Build.findAll({where: {id: req.query.build_id}})
    .then(function (build) {
      if (build.length > 0) {
        _.first(build).getCommits().success(function (commits) {
          res.json(commits);
        });
      } else res.json([]);
    });
};
