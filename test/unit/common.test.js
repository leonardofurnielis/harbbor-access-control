'use strict';

/* eslint-disable */

const assert = require('assert');
const {
  pathToArray,
  findGroupFromRequest,
  findPermissionForGroup,
  findPermissionForRoute,
  findPermissionForMethod,
  deny,
  isAllowed
} = require('../../lib/common');
const policies = require('./../mocks/policies.mock.json');

describe('deny()', () => {
  it('Should return default deny Object', done => {
    expect(deny()).toEqual({ code: 403, message: 'Unauthorized access' });
    done();
  });

  it('Should return deny Object with custom message when is difined', done => {
    expect(deny('This is a custom message').message).toBe('This is a custom message');
    done();
  });
});

describe('pathToArray()', () => {
  it('Should return array of string', done => {
    expect(pathToArray('api/v1/test')).toEqual(['api', 'v1', 'test']);
    done();
  });

  it('Should return error when arguments is not type string', done => {
    try {
      pathToArray(100);
    } catch (err) {
      expect(err.message).toEqual('Only string arguments are allowed');
    }
    done();
  });
});

describe('findGroupFromRequest()', () => {
  it('Should return default group if not found group', done => {
    const req = {};
    expect(findGroupFromRequest(req)).toEqual('guest');
    done();
  });

  it('Should return user group from request into req.session.group', done => {
    const req = { session: { group: 'admin' } };
    expect(findGroupFromRequest(req)).toEqual('admin');
    done();
  });

  it('Should return user group from request into req.group', done => {
    const req = { group: 'admin' };
    expect(findGroupFromRequest(req)).toEqual('admin');
    done();
  });

  it('Should return user group from request into searchPath', done => {
    const req = { session: { user: { group: 'admin' } } };
    expect(findGroupFromRequest(req, 'session.user.group')).toEqual('admin');
    done();
  });
});

describe('findPermissionForGroup()', () => {
  it('Should return selected group array', done => {
    expect(findPermissionForGroup(policies, 'guest')).toEqual(policies);
    done();
  });

  it('Should return false if group not exist', done => {
    expect(findPermissionForGroup(policies, 'admin')).toEqual(false);
    done();
  });
});

describe('findPermissionForRoute()', () => {
  const permission = [{
    resource: '/test',
    methods: ['GET'],
    action: 'allow'
  }];

  it('Should return policies array', done => {
    expect(findPermissionForRoute(policies, '/test')).toEqual(permission);
    done();
  });

  it('Should return policies array when using prefix routes', done => {
    expect(findPermissionForRoute(policies, '/api/v1/test', '/api/v1')).toEqual(permission);
    done();
  });

  it('Should return false when group don\'t have permission to this route', done => {
    expect(findPermissionForRoute(policies, '/home')).toEqual(false);
    done();
  });

  it('Should return false when prefix is empty', done => {
    expect(findPermissionForRoute(policies, '/api/v1/test')).toEqual(false);
    done();
  });
});

describe('findPermissionForMethod()', () => {
  it('Should return policies array', done => {
    const permission = [{
      resource: '/test',
      methods: ['GET'],
      action: 'allow'
    }];
    expect(findPermissionForMethod(permission, 'GET')).toEqual(permission);
    done();
  });

  it('Should return policies array when policies method is *', done => {
    const permission = [{
      resource: '/test',
      methods: '*',
      action: 'allow'
    }];
    expect(findPermissionForMethod(permission, 'POST')).toEqual(permission);
    done();
  });

  it('Should return false when group don\'t have permission to this method', done => {
    const permission = [{
      resource: '/test',
      methods: ['GET'],
      action: 'allow'
    }];
    expect(findPermissionForRoute(policies, 'POST')).toEqual(false);
    done();
  });
});

describe('isAllowed()', () => {
  it('Should return policies array if action is allowed', done => {
    const permission = [{
      resource: '/test',
      methods: ['GET'],
      action: 'allow'
    }];
    expect(isAllowed(permission)).toEqual(permission);
    done();
  });

  it('Should return false when action is deny', done => {
    const permission = [{
      resource: '/test',
      methods: '*',
      action: 'deny'
    }];
    expect(isAllowed(permission)).toEqual(false);
    done();
  });
});

