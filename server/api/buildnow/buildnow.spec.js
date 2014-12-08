'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('POST /api/buildnow', function() {
  var data = {project_id: 1};
  it('should respond with JSON array', function(done) {
    request(app)
      .post('/api/buildnow')
      .send(data)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.have.property('status');
        res.body.status.should.equal("ok");
        done();
      });
  });
});
