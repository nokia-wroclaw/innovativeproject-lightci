'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');
// Get list of outputs
exports.index = function(req, res) {
  db.findInstance('BuildOutputs', {where: { BuildId: req.query.build_id }})
    .then(function(outputs){
      res.json(outputs);
    });
};
