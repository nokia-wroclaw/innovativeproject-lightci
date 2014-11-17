/**
 * Database Handler file
 */
// get db models
var models = require('../../models/models');
// Setup sequelize
var Sequelize = require('sequelize');
var Commits = null,
  Projects = null,
  Builds = null;
const cCommits = 'Commit',
  cProjects = 'Project',
  cBuilds = 'Build';
function establishConnection(dbDir, dbName) {
  var sequelize = new Sequelize(dbName, 'root', 'root', {
    dialect: "sqlite",
    port: 3306,
    storage: dbDir
  });
  sequelize
    .authenticate()
    .complete(function (err) {
      if (!!err) {
        console.log('Unable to connect to the database:', err)
      } else {
      }
    });
  return sequelize;
}
function defineTables(sequelize) {
  Commits = sequelize.define(cCommits, models.fDBModCommits(), {
    timestamps: false
  });
  Projects = sequelize.define(cProjects, models.fDBModProjects(), {
    timestamps: false
  });
  Builds = sequelize.define(cBuilds, models.fDBModBuilds(), {
    timestamps: false
  });
  Projects.hasMany(Commits, {as: 'Commits'});
  Projects.hasMany(Builds, {as: 'Builds'});
  Builds.hasMany(Commits, {as: 'Commits'});
}
function syncTables(sequelize, callback) {
  sequelize
    .sync()
    .complete(function (err) {
      if (!!err) {
        console.log('An error occurred while creating the table:', err)
      } else {
        callback();
      }
    });
}
function updateInstance(instance, attrs) {
  return instance.updateAttributes(attrs);
}
function createInstance(wich, info) {
  if (wich === cCommits) {
    return Commits.create({
      commit_id: info['revision'],
      commit_author: info['author'],
      commit_date: info['date'],
      commit_comment: info['message']
    })
  }
  else if (wich == cProjects) {
    return Projects.create({
      project_url: info['url'],
      project_name: info['name']
    })
  }
  else if (wich == cBuilds) {
    return Builds.create({
      build_ispending: info['ispending'],
      build_issuccess: info['issuccess'],
      build_date: info['date']
    })
  }
}

function findInstance(wich, where) {
  if (wich === cCommits) {
    return Commits.findAll(where)
  }
  else if (wich === cProjects) {
    return Projects.findAll(where)
  }
  else if (wich === cBuilds) {
    return Builds.findAll(where)
  }
}
function createTables(dbDir, callback) {
  var sequelize = establishConnection(dbDir, 'lightci_db');
  defineTables(sequelize);
  syncTables(sequelize, callback);
}
exports.createTables = createTables;
exports.createInstance = createInstance;
exports.findInstance = findInstance;
exports.updateInstance = updateInstance;
