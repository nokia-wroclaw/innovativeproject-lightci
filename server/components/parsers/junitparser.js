/**
 * Created by ms on 24.11.14.
 */
var parser = require('junit-xml-parser').parser;
var fs = require('fs');


function parse(projectName,script, build,db ){
if(script.parser=='junit'){
  fs.readFile( "repos/" + projectName + "/" + script.outputPath, function(err, data) {
    parser.parse(data)
      .then(function (result) {
        db.createInstance('TestSuites', result.suite).then(function (testSuite) {
          build.addTestSuite([testSuite]);
          result.suite.tests.forEach(function(test){
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
