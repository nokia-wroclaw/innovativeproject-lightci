'use strict';

var _ = require('lodash');


// Get list of removes
exports.destroy = function(req, res) {
  var db = req.db;
  var projectHandler = require("../../components/project-handling/project-handler")(db);

  db.Project.findAll({where: {id: req.body.project_id}})
    .then(function (proj) {

      if (proj.length == 0) {
        res.json({info: null, error: "No such project"});
      } else {

        projectHandler.removeProject(proj[0]);
        res.json({info: "Success (I guess)!", error: null});
      }

  });


};
