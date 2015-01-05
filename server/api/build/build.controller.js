'use strict';

var _ = require('lodash');

// Get list of builds
exports.show = function(req, res) {
  var db = req.db;
  db.Build.findAll({where: { ProjectId: req.query.project_id },order: 'build_date DESC'})
    .then(function(builds){
      res.json(builds);
    });
};
