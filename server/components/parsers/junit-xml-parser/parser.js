var q = require('q');
var xml2js = require('xml2js');
var parsed = require('./parsed');

function parse(string) {
  var deferred = q.defer();

  xml2js.parseString(string, function (error, raw) {
    return error ? deferred.reject(new Error(error)) : deferred.resolve(parsed.from(raw));
  });

  return deferred.promise;
}

exports.parse = parse;
