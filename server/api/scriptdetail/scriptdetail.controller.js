'use strict';

var _ = require('lodash');
var db = require('../../components/db/db');

// Get list of scriptdetails
exports.index = function(req, res) {
  var scriptDetails = { testSuites: [] };

  db.findInstance('BuildOutputs', {where: { id: req.query.script_id }})
    .then(function(outputs){
      outputs[0].output= require('querystring').unescape(outputs[0].output);
      scriptDetails.scriptOutputs = outputs[0].dataValues;

      db.findInstance('TestSuites', {where: { BuildOutputId: req.query.script_id }})
        .then(function(suites){

          for(var i=0;i<suites.length;i++){
            scriptDetails.testSuites.push(suites[i].dataValues);
          }

          res.json(scriptDetails);
        });
    });

};
