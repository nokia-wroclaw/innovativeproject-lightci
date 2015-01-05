'use strict';

var _ = require('lodash');
var Q = require("q");
// Get list of projects
exports.index = function (req, res) {
  var db = req.db;
  var projects = [];
  db.Project.findAll({}).then(function (dbProjects) {
    projects = _.map(dbProjects, function (dbProject) {
      return dbProject.dataValues;
    });
    var promises = _.map(projects, function (project) {
      return db.Build.findAll({where: {ProjectId: project.id}, limit: 5, order: 'build_date DESC'});
    });
    return Q.all(promises);
  }).then(function (builds) {
    _.each(builds, function (build) {
      var buildHistory = _.map(build, function (dbBuild) {
        return dbBuild.dataValues.build_status;
      });
      if (build.length > 0) {
        var pro = _.first(_.filter(projects, function (project) {
          return project.id === _.first(build).dataValues["ProjectId"];
        }));
        pro.lastBuilds = buildHistory;
        pro.lastBuildTime = new Date(_.first(build).dataValues['build_date']);
      }
    });
    res.json(projects);
  });
};
