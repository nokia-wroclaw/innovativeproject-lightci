'use strict';

var _ = require('lodash');
var db = require('../../models');

// Get list of deploys
exports.index = function(req, res) {
  db.Deploy.findAll({where: {BuildId: req.query.build_id}})
    .then(function(deploys){
      res.json(deploys);
    });
};
