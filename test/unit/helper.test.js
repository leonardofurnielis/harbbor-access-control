'use strict';

const {
  pathToArray,
  findAGFromRequest,
  findAGPermission,
  findRPPermission,
  findMethodPermission,
  isAllowed,
  deny,
} = require('../../lib/helper');

const accessPolicies = require('../mock/access-policies.json');

describe('pathToArray()', () => {
  it('Should return array of string', (done) => {
    expect(pathToArray('api/v1/test')).toEqual(['api', 'v1', 'test']);
    done();
  });

  it('Should return error when arguments is not type string', (done) => {
    try {
      pathToArray(100);
    } catch (err) {
      expect(err.message).toEqual('Only string arguments are allowed');
    }
    done();
  });
});

describe('findAGFromRequest()', () => {
  it('Should return default group if not found group', (done) => {
    const req = {};
    expect(findAGFromRequest(req)).toEqual('guest');
    done();
  });

  it('Should return user group from request into req.session.group', (done) => {
    const req = { session: { group: 'admin' } };
    expect(findAGFromRequest(req)).toEqual('admin');
    done();
  });

  it('Should return user group from request into req.locals.group', (done) => {
    const req = { locals: { group: 'admin' } };
    expect(findAGFromRequest(req)).toEqual('admin');
    done();
  });

  it('Should return user group from request into req.group', (done) => {
    const req = { group: 'admin' };
    expect(findAGFromRequest(req)).toEqual('admin');
    done();
  });

  it('Should return user group from request into searchPath', (done) => {
    const req = { session: { user: { group: 'admin' } } };
    expect(findAGFromRequest(req, 'session.user.group')).toEqual('admin');
    done();
  });
});

describe('findAGPermission()', () => {
  it('Should return selected group array', (done) => {
    expect(findAGPermission(accessPolicies, 'guest')).toEqual(accessPolicies[0].permissions);
    done();
  });

  it('Should return false if group not exist', (done) => {
    expect(findAGPermission(accessPolicies, 'admin')).toEqual(false);
    done();
  });
});

describe('findRPPermission()', () => {
  const permission = [
    {
      resource: '/test',
      methods: ['GET'],
      action: 'allow',
    },
    {
      resource: '/test',
      methods: ['POST'],
      action: 'deny',
    },
  ];

  it('Should return accessPolicies array', (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/test')).toEqual(permission);
    done();
  });

  it('Should return accessPolicies array when using prefix routes', (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/api/v1/test', '/api/v1')).toEqual(permission);
    done();
  });

  it("Should return false when group don't have permission to this route", (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/home')).toEqual(false);
    done();
  });

  it('Should return false when prefix is empty', (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/api/v1/test')).toEqual(false);
    done();
  });
});

describe('findMethodPermission()', () => {
  it('Should return accessPolicies array', (done) => {
    const permission = [
      {
        resource: '/test',
        methods: ['GET'],
        action: 'allow',
      },
    ];
    expect(findMethodPermission(permission, 'GET')).toEqual(permission);
    done();
  });

  it('Should return accessPolicies array when accessPolicies method is *', (done) => {
    const permission = [
      {
        resource: '/test',
        methods: '*',
        action: 'allow',
      },
    ];
    expect(findMethodPermission(permission, 'POST')).toEqual(permission);
    done();
  });

  it("Should return false when group don't have permission to this method", (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, 'POST')).toEqual(false);
    done();
  });
});

describe('isAllowed()', () => {
  it('Should return accessPolicies array if action is allowed', (done) => {
    const permission = [
      {
        resource: '/test',
        methods: ['GET'],
        action: 'allow',
      },
    ];
    expect(isAllowed(permission)).toEqual(permission);
    done();
  });

  it('Should return false when action is deny', (done) => {
    const permission = [
      {
        resource: '/test',
        methods: '*',
        action: 'deny',
      },
    ];
    expect(isAllowed(permission)).toEqual(false);
    done();
  });
});

describe('deny()', () => {
  it('Should return default deny Object', (done) => {
    expect(deny()).toEqual({
      error: {
        status_code: 403,
        code: 'FORBIDDEN',
        message: 'Unauthorized Access',
      },
    });
    done();
  });

  it('Should return deny Object with custom message when is difined', (done) => {
    expect(deny('This is a custom message').error.message).toBe('This is a custom message');
    done();
  });
});
