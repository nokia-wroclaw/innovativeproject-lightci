/**
 * Database models file
 */

var Sequelize = require('sequelize');

module.exports = {

  fDBModCommits: function () {
    var c =
    {
      commit_id: Sequelize.STRING,
      commit_date: Sequelize.DATE,
      commit_author: Sequelize.STRING,
      commit_comment: Sequelize.STRING
    };

    return c;
  },

  fDBModProjects: function () {
    var c =
    {
      project_url: Sequelize.STRING,
      project_name: Sequelize.STRING,
      project_average_build_time: Sequelize.DATE
    };

    return c;
  },

  fDBModBuilds: function () {
    var c =
    {
      build_date: Sequelize.DATE,
      build_status: Sequelize.STRING
    };

    return c;
  },

  fDBModBuildOutputs: function () {
    var c =
    {
      scriptName:Sequelize.STRING,
      output: Sequelize.STRING,
      isSuccess:Sequelize.BOOLEAN
    };

    return c;
  },
  fDBModTestSuites: function () {
    var c =
    {
      name:Sequelize.STRING,
      time: Sequelize.STRING,
      tests: Sequelize.INTEGER,
      failures: Sequelize.INTEGER,
      skipped: Sequelize.INTEGER,
      errors: Sequelize.INTEGER
    };

    return c;
  },
  fDBModTests: function () {
    var c =
    {
      name:Sequelize.STRING,
      time: Sequelize.STRING,
      type: Sequelize.STRING,
      message: Sequelize.STRING
    };

    return c;
  },

  fDBModUsers: function () {
    var c =
    {
      user_name: Sequelize.STRING,
      user_pass: Sequelize.STRING,
      user_level: Sequelize.INTEGER,
      user_email: Sequelize.STRING
    };

    return c;
  },
  fDBModDeploys: function () {
    var c =
    {
      deploy_server: Sequelize.STRING,
      deploy_status: Sequelize.STRING,
      deploy_message: Sequelize.STRING
    };

    return c;
  }
};
