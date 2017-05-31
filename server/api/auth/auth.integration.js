'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newAuth;

describe('Auth API:', function() {
  describe('GET /api/auth', function() {
    var auths;

    beforeEach(function(done) {
      request(app)
        .get('/api/auth')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          auths = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      auths.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/auth', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/auth')
        .send({
          name: 'New Auth',
          info: 'This is the brand new auth!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newAuth = res.body;
          done();
        });
    });

    it('should respond with the newly created auth', function() {
      newAuth.name.should.equal('New Auth');
      newAuth.info.should.equal('This is the brand new auth!!!');
    });
  });

  describe('GET /api/auth/:id', function() {
    var auth;

    beforeEach(function(done) {
      request(app)
        .get(`/api/auth/${newAuth._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          auth = res.body;
          done();
        });
    });

    afterEach(function() {
      auth = {};
    });

    it('should respond with the requested auth', function() {
      auth.name.should.equal('New Auth');
      auth.info.should.equal('This is the brand new auth!!!');
    });
  });

  describe('PUT /api/auth/:id', function() {
    var updatedAuth;

    beforeEach(function(done) {
      request(app)
        .put(`/api/auth/${newAuth._id}`)
        .send({
          name: 'Updated Auth',
          info: 'This is the updated auth!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedAuth = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedAuth = {};
    });

    it('should respond with the updated auth', function() {
      updatedAuth.name.should.equal('Updated Auth');
      updatedAuth.info.should.equal('This is the updated auth!!!');
    });

    it('should respond with the updated auth on a subsequent GET', function(done) {
      request(app)
        .get(`/api/auth/${newAuth._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let auth = res.body;

          auth.name.should.equal('Updated Auth');
          auth.info.should.equal('This is the updated auth!!!');

          done();
        });
    });
  });

  describe('PATCH /api/auth/:id', function() {
    var patchedAuth;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/auth/${newAuth._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Auth' },
          { op: 'replace', path: '/info', value: 'This is the patched auth!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedAuth = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedAuth = {};
    });

    it('should respond with the patched auth', function() {
      patchedAuth.name.should.equal('Patched Auth');
      patchedAuth.info.should.equal('This is the patched auth!!!');
    });
  });

  describe('DELETE /api/auth/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/auth/${newAuth._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when auth does not exist', function(done) {
      request(app)
        .delete(`/api/auth/${newAuth._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
