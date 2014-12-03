/**
 * Created by ms on 24.11.14.
 */
var parser = require('junit-xml-parser').parser;
var fs = require('fs-promise');


function parse(projectName,script, buildOutput,db ) {
  if (script.parser == 'junit') {
    fs.readFile(__dirname+"/../../../repos/" + projectName + "/" + script.outputPath)
      .then(function (data) {
        parser.parse(data)
          .then(function (result) {
            db.createInstance('TestSuites', result.suite).then(function (testSuite) {
              buildOutput.addTestSuite([testSuite]);
              result.suite.tests.forEach(function (test) {
                db.createInstance('Tests', test).then(function (t) {
                  testSuite.addTest([t]);
                });
              });
            });
          })
          .fail(function (err) {
            console.log(err);
          });
      });
  }
}

exports.junitParser = parse;
