/**
 * Database Handler file
 */
// get db models
var models = require('../../models/models');
// Setup sequelize
var Sequelize = require('sequelize');
var Commits = null,
  Projects = null,
  Builds = null,
  BuildOutputs=null,
  TestSuites=null,
  Tests=null;
const cCommits = 'Commit',
  cProjects = 'Project',
  cBuilds = 'Build',
  cBuildOutputs = 'BuildOutputs',
  cTestSuites = 'TestSuites',
  cTests = 'Tests';
var sequelize;
var _ = require('lodash');

function establishConnection(dbDir, dbName) {
  var seq = new Sequelize(dbName, 'root', 'root', {
    dialect: "sqlite",
    port: 3306,
    storage: dbDir,
    logging: false,
    dialectOptions: {
      charset: 'utf8'
    }
  });
  seq
    .authenticate()
    .complete(function (err) {
      if (!!err) {
        console.log('Unable to connect to the database:', err)
      } else {
      }
    });
  return seq;
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
  BuildOutputs = sequelize.define(cBuildOutputs, models.fDBModBuildOutputs(), {
      timestamps: false
    });
  TestSuites = sequelize.define(cTestSuites, models.fDBModTestSuites(), {
    timestamps: false
  });
  Tests = sequelize.define(cTests, models.fDBModTests(), {
    timestamps: false
  });
  Projects.hasMany(Commits, {as: 'Commits'});
  Projects.hasMany(Builds, {as: 'Builds'});
  Commits.hasMany(Builds, {as: 'Builds', through: 'BuildsCommits'});
  Builds.hasMany(Commits, {as: 'Commits', through: 'BuildsCommits'});
  Builds.hasMany(BuildOutputs,{as: 'BuildOutputs'});
  BuildOutputs.hasMany(TestSuites,{as: 'TestSuites'});
  TestSuites.hasMany(Tests,{as: 'Tests'});

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
function deleteInstance(instance, where) {
  return instance.destroy(where);
}
function updateInstance(instance, attrs) {
  return instance.updateAttributes(attrs);
}
function deleteInstance(instance) {
  return instance.destroy();
}
function createInstance(which, info) {
  if (which === cCommits) {
    return Commits.create({
      commit_id: info['revision'],
      commit_author: info['author'],
      commit_date: info['date'],
      commit_comment: info['message']
    })
  }
  else if (which == cProjects) {
    return Projects.create({
      project_url: info['url'],
      project_name: info['name']
    })
  }
  else if (which == cBuilds) {
    return Builds.create({
      build_status: info['status'],
      build_date: info['date']
    })
  }
  else if (which == cBuildOutputs) {
    return BuildOutputs.create({
      scriptName: info['scriptName'],
      output: require('querystring').escape((info['output'])),
      isSuccess:info['isSuccess']
    })
  }
  else if (which == cTestSuites) {
    return TestSuites.create({
      name: info['name'],
      time: info['time'],
      tests: info['summary'].tests,
      failures:info['summary'].failures,
      skipped:info['summary'].skipped,
      errors:info['summary'].errors

    })
  }
  else if (which == cTests) {
      return Tests.create({
        name: info['name'],
        time: info['time'],
        type: _.has(info,'failure')?info['failure'].type:"",
        massage:  _.has(info,'failure')?info['failure'].message:""
      })

  }
}

function findInstance(which, where) {
  if (which === cCommits) {
    return Commits.findAll(where);
  }
  else if (which === cProjects) {
    return Projects.findAll(where);
  }
  else if (which === cBuilds) {
    return Builds.findAll(where);
  }
  else if(which === cBuildOutputs){
    return BuildOutputs.findAll(where);
  }
  else if(which === cTestSuites){
    return TestSuites.findAll(where);
  }
  else if(which === cTests){
    return Tests.findAll(where);
  }
}
function createTables(dbDir, callback) {
  sequelize = establishConnection(dbDir, 'lightci_db');
  defineTables(sequelize);
  syncTables(sequelize, callback);
}

function getSequelize() {
  return sequelize;
}

exports.createTables = createTables;
exports.createInstance = createInstance;
exports.findInstance = findInstance;
exports.updateInstance = updateInstance;
exports.deleteInstance = deleteInstance;
exports.getSequelize = getSequelize;
