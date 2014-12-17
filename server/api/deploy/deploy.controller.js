'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of deploys
exports.index = function(req, res) {
  db.findInstance('Deploys', {where: {BuildId: req.query.build_id}})
    .then(function(deploys){
      res.json(deploys);
    });
};
