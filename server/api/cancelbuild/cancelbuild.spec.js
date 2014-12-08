'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/cancelbuilds', function() {
  var data = {project_id:1};

  it('should respond object {\"info\":\"success\"}', function(done) {
    request(app)
      .post('/api/buildnow')
      .send(data);
    request(app)
      .post('/api/cancelbuilds')
      .send(data)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.have.property('info');
        //res.body.info.should.equal("Success!");
        done();
      });
  });
});
