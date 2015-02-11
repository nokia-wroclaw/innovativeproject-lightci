'use strict';

var _ = require('lodash');
var db = require('../../models');
var conf = require("../../components/config-backup/config-backup");
var fs = require("fs");

// Get list of configs
exports.index = function (req, res) {
  var globalConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/global.config.json"));
  db.ConfigLog.findAll({})
    .then(function (cfgs) {
      res.json(cfgs.concat(globalConfig));
    });
};

exports.create = function (req, res) {
  console.log("Restoring config "+req.body.id);
  conf.restoreConfig(req.body.id);
  res.json({'success': true})
};

exports.update = function (req, res) {
  var globalConfig = JSON.parse(fs.readFileSync(__dirname + "/../../config/global.config.json"));
  var queueMax = req.body.queue_max;

  if (parseInt(Number(queueMax)) == queueMax && queueMax>0) {
    globalConfig.maxBuildingProjects = Number(queueMax);
    fs.writeFileSync(__dirname + "/../../config/global.config.json", JSON.stringify(globalConfig, undefined, 2));
    res.json({'success': true})
  } else {
    res.json({'success': false, 'message': 'Incorrect value'})
  }
};
