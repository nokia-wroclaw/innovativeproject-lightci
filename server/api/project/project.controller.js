'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of projects
exports.index = function(req, res) {
  db.findInstance('Project',{})
    .then(function(projects){
      res.json(projects);
    });

};
