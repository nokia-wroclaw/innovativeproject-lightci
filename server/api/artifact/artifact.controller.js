'use strict';

var _ = require('lodash');
var db = require('../../models');
var fs = require('fs');
// Get list of artifacts
exports.index = function(req, res) {
  db.Artifact.findAll({where: {BuildId: req.query.build_id}})
    .then(function(artifacts){
      res.json(artifacts);
    });
};

