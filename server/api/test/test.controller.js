'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of tests
exports.index = function(req, res) {
  db.findInstance('Tests', {where: { TestSuiteId: req.query.suite_id }})
    .then(function(tests){

      res.json(tests);

    });
};
