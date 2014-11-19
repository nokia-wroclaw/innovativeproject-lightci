'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');
// Get list of outputs
exports.index = function(req, res) {
  db.findInstance('BuildOutputs', {where: { BuildId: req.query.build_id }})
    .then(function(outputs){
      for(var i=0;i<outputs.length;i++){
        outputs[i].output= require('querystring').unescape(outputs[i].output);
      }
      res.json(outputs);
    });
};
