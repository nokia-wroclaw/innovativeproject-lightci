'use strict';

var _ = require('lodash');
var db = require('../../models');

exports.index = function(req, res) {
  db.Test.findAll({where: { TestSuiteId: req.query.suite_id }})
    .then(function(tests){
      res.json(tests);
    });
};
