'use strict';

var _ = require('lodash');

exports.index = function(req, res) {
  var db = req.db;
  db.ScriptOutput.findAll({where: { BuildId: req.query.build_id }})
    .then(function(outputs){
      for(var i=0;i<outputs.length;i++){
        outputs[i].output= require('querystring').unescape(outputs[i].output);
      }
      res.json(outputs);
    });
};
