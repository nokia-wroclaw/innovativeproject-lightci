'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
// Get list of downloads

exports.show = function(req, res) {

  var file = 'artifacts/'+req.query.projectname+'/'+req.query.fileName;

  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);
};
