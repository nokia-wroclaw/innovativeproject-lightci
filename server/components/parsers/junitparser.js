/**
 * Created by ms on 24.11.14.
 */
var parser = require('junit-xml-parser').parser;
var fs = require('fs-promise');
var _ = require("lodash");

function parse(projectName, script, buildOutput, db) {
  if (script.parser === 'junit') {
    var outputFileData = fs.readFile(__dirname + "/../../../repos/" + projectName + "/" + script.outputPath);

    outputFileData = outputFileData.then(function (data) {
      var new_data;
      if(data) {
        new_data = data.toString().match(/<testsuite(.|[ \n])*<\/testsuite>/g);
      } else new_data = "";

      return parser.parse(_.first(new_data));
    });

    outputFileData
      .then(function (result) {
        addResultToDB(result.suite, buildOutput, db);
      })
      .fail(function (err) {
        console.log(err);
      });
  }
};

function addResultToDB(result, buildOutput, db) {
  db.TestSuite.create(resultToTestSuiteModel(result)).then(function (testSuite) {
    buildOutput.addTestSuite([testSuite]);

    _.each(result.tests, function (test) {
      db.Test.create(test).then(function (t) {
        testSuite.addTest([t]);
      });
    });
  });
};

function resultToTestSuiteModel(result) {
  return {
    name: result['name'],
    time: result['time'],
    tests: result['summary'].tests,
    failures: result['summary'].failures,
    skipped: result['summary'].skipped,
    errors: result['summary'].errors
  };
};

exports.junitParser = parse;
