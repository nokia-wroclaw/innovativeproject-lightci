'use strict';

var _ = require('lodash');
var db = require('../../models');
var conf = require("../../components/config-backup/config-backup");

// Get list of configs
exports.index = function (req, res) {
  db.ConfigLog.findAll({})
    .then(function (cfgs) {
      res.json(cfgs);
    });
};

exports.update = function (req, res) {
  console.log("Restoring config "+req.body.id);
  conf.restoreConfig(req.body.id);
  res.json({'success': true})
};
