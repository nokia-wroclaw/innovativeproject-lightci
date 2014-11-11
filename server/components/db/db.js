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
	port:    3306,
	storage: dbDir
      });

    sequelize
      .authenticate()
      .complete(function(err) {
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
      .complete( function(err) {
	if (!!err) {
	  console.log('An error occurred while creating the table:', err)
	} else {
	  callback();
	}
      });
}

function createInstance(wich, info) {
    return createInstance(wich, info, null);
}

function createInstance(wich, info, assignTo) {

    if ( wich === cCommits ) {
	Commits.create({
	    commit_id: info['revision'],
	    commit_author: info['author'],
	    commit_date: info['date'],
	    commit_comment: info['message']
	}).then(function(commit) {
	  if (assignTo) {
	    assignTo.setCommits([commit]).success(function() {
	      // asssociation succesful!
	    });
	  }
	});
    }
    else
    if ( wich == cProjects ) {
	return Projects.create({
	    project_url: info['url'],
	    project_name: info['name']
	})
    }
    else
    if ( wich == cBuilds ) {
	return Builds.create({
	    build_revision: info['revision'],
	    build_date: info['date']
	}).then(function(build) {
	  if (assignTo) {
	    assignTo.setBuilds([build]).success(function() {
	      // asssociation succesful!
	    });
	  }
	});

    }
}

function findInstance(wich, where) {

      if ( wich === cCommits ) {
	  return Commits.findAll(where)
/*	    .complete(function(err, f) {
	      //console.log("Fetching result:");
	      //console.log(f);
	      return f;
	    })*/
      }
      else
      if ( wich === cProjects ) {
	  return Projects.findAll(where)
/*	    .complete(function(err, f) {
	      //console.log("Fetching result:");
	      //console.log(f);
	      return f;
	    })*/
      }
      else
      if ( wich === cBuilds ) {
	  return Builds.findAll(where)
/*	    .complete(function(err, f) {
	      //console.log("Fetching result:");
	      //console.log(f);
	      return f;
	    })*/
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
