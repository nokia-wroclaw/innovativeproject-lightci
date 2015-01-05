'use strict';

var _ = require('lodash');

exports.index = function(req, res) {
  var db = req.db;
  db.Test.findAll({where: { TestSuiteId: req.query.suite_id }})
    .then(function(tests){
      res.json(tests);
    });
};
