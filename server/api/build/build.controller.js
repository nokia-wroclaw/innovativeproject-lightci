'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of builds
exports.show = function(req, res) {
  db.findInstance('Build', {where: { ProjectId: req.query.project_id }})
    .then(function(builds){
      res.json(builds);
    });
};
