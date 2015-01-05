'use strict';

var _ = require('lodash');

exports.create = function(req, res) {
  var db = req.db;
  var run = require("../../components/run-script/run-script")(db);
  db.Project.findAll({where: {id: req.body.project_id}})
    .then(function (proj) {

      if (proj.length == 0) {
        res.json({info: null, error: "No such project"});
      } else {

        run.cancel(_.first(proj));
        res.json({info: "Success!", error: null});
      }

    });
};
