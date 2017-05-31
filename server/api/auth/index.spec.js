'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var authCtrlStub = {
  index: 'authCtrl.index',
  show: 'authCtrl.show',
  create: 'authCtrl.create',
  upsert: 'authCtrl.upsert',
  patch: 'authCtrl.patch',
  destroy: 'authCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var authIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './auth.controller': authCtrlStub
});

describe('Auth API Router:', function() {
  it('should return an express router instance', function() {
    authIndex.should.equal(routerStub);
  });

  describe('GET /api/auth', function() {
    it('should route to auth.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/auth/:id', function() {
    it('should route to auth.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'authCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/auth', function() {
    it('should route to auth.controller.create', function() {
      routerStub.post
        .withArgs('/', 'authCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/auth/:id', function() {
    it('should route to auth.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'authCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/auth/:id', function() {
    it('should route to auth.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'authCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/auth/:id', function() {
    it('should route to auth.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
