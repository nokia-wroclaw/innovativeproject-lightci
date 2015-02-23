var parser = require('./parser');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var q = require('q');

function fromFiles(listOfFiles) {
  var deferred = q.defer();

  var listOfReads = _(listOfFiles).map(function (file) {
    return function (callback) { fs.readFile(file, callback); };
  }).value();

  async.parallel(listOfReads, function (error, contents) {
    if (error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve(exports.strings(_(contents).invoke('toString').value()));
    }
  });

  return deferred.promise;
}

function fromStrings(listOfStrings) {
  return _(listOfStrings).map(parser.parse).value();
}

exports.files = fromFiles;
exports.strings = fromStrings;
