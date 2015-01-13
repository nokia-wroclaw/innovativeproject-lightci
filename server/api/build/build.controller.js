'use strict';

var _ = require('lodash');
var db = require('../../models');
// Get list of builds
exports.show = function(req, res) {
  db.Build.findAll({where: { ProjectId: req.query.project_id },order: 'build_date DESC'})
    .then(function(builds){
      res.json(builds);
    });
};
