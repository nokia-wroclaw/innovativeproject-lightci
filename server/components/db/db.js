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
	  // SUCCESS
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
}

function syncTables(sequelize) {
  
    sequelize
      .sync()
      .complete( function(err) {
	if (!!err) {
	  console.log('An error occurred while creating the table:', err)
	} else {
	  // SUCCESS
	}
      });
}

function createInstance(wich, info) {
    createInstance(wich, info, null);
}

function createInstance(wich, info, assignTo) {
  
    if ( wich === cCommits ) {
	Commits.create({
	    commit_id: info['revision'],
	    commit_author: info['author'],
	    commit_date: info['date'],
	    commit_comment: info['message']
	})
	.complete(function(err, c) {
	    if (assignTo) {
		assignTo.setCommits(c).success(function() {
		    // ...
		});
	    }
	    
	    return c;
	})
    }
    else
    if ( wich == cProjects ) {
	Projects.create({
	    project_url: info['url'],
	    project_name: info['name']
	})
	.complete(function(err, p) {
	    if (assignTo) {
		assignTo.setCommits(p).success(function() {
		    // ...
		});
	    }
	    
	    return p;
	})
      
    }
    else
    if ( wich == cBuilds ) {
	Builds.create({
	    build_revision: info['revision'],
	    build_date: info['date']
	})
	.complete(function(err, b) {
	    if (assignTo) {
		assignTo.setBuilds(b).success(function() {
		    // ...
		});
	    }
	    
	    return b;
	})
      
    }
}

function findInstance(wich, where) {
  
      if ( wich === cCommits ) {
	  Commits.findAll(where)
	    .complete(function(err, f) {
	      //console.log("Fetching result:");
	      //console.log(f);
	      return f;
	    })
      }
      else
      if ( wich === cProjects ) {
	  Projects.findAll(where)
	    .complete(function(err, f) {
	      //console.log("Fetching result:");
	      //console.log(f);
	      return f;
	    })
      }
}
 
 
function createTables(dbDir) {
  
    var sequelize = establishConnection(dbDir, 'lightci_db');
    
    defineTables(sequelize);
    syncTables(sequelize);  
}

exports.createTables = createTables;
exports.createInstance = createInstance;
exports.findInstance = findInstance;