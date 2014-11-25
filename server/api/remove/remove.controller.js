'use strict';

var _ = require('lodash');
var projectHandler = require("../../components/project-handling/project-handler");
var db = require('../../components/db/db');
var fs = require("fs");

// Get list of removes
exports.destroy = function(req, res) {

  db.findInstance('Project', {where: {id: req.body.project_id}})
    .then(function (proj) {

      if (proj.length == 0) {
        res.json({info: null, error: "No such project"});
      } else {

        projectHandler.removeProject(proj[0]);
        res.json({info: "Success (I guess)!", error: null});
      }

  });


};
