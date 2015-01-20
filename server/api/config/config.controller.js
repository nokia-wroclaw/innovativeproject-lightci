'use strict';

var _ = require('lodash');
var db = require('../../models');

// Get list of configs
exports.index = function (req, res) {
  db.ConfigLog.findAll({})
    .then(function (cfgs) {
      res.json(cfgs);
    });
};

exports.update = function (req, res) {
  console.log("Restore config "+req.body.id);
};
