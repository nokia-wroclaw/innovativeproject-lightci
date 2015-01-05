'use strict';

var _ = require('lodash');


// Get list of scriptdetails
exports.index = function(req, res) {
  var db = req.db;
  var scriptDetails = { testSuites: [] };

  db.ScriptOutput.findAll({where: { id: req.query.script_id }})
    .then(function(outputs){
      if(outputs.length>0) {
        _.first(outputs).output = _.unescape(_.first(outputs).output);
        scriptDetails.scriptOutputs = _.first(outputs).dataValues;

        db.TestSuite.findAll({where: {ScriptOutputId: req.query.script_id}})
          .then(function (suites) {

            for (var i = 0; i < suites.length; i++) {
              scriptDetails.testSuites.push(suites[i].dataValues);
            }

            res.json(scriptDetails);
          });
      } else {
        res.json(scriptDetails);
      }
    });
};
