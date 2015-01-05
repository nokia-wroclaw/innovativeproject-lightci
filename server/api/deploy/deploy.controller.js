'use strict';

var _ = require('lodash');

// Get list of deploys
exports.index = function(req, res) {
  var db = req.db;

  db.Deploy.findAll({where: {BuildId: req.query.build_id}})
    .then(function(deploys){
      res.json(deploys);
    });
};
