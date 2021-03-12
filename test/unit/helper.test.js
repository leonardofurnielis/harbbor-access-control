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
  test('Should return tokens', (done) => {
    expect(pathToArray('api/v1/test')).toEqual(['api', 'v1', 'test']);
    done();
  });

  test('When arguments is not type string, should return error', (done) => {
    try {
      pathToArray(100);
    } catch (err) {
      expect(err.message).toEqual('The value must be string');
    }
    done();
  });
});

describe('findAGFromRequest()', () => {
  test('When access group not found, should return default access group', (done) => {
    const req = {};
    expect(findAGFromRequest(req)).toEqual('guest');
    done();
  });

  test('Should return user access group from request at req.session.group', (done) => {
    const req = { session: { group: 'admin' } };
    expect(findAGFromRequest(req)).toEqual('admin');
    done();
  });

  test('Should return user access group from request at req.locals.group', (done) => {
    const req = { locals: { group: 'admin' } };
    expect(findAGFromRequest(req)).toEqual('admin');
    done();
  });

  test('Should return user access group from request at req.group', (done) => {
    const req = { group: 'admin' };
    expect(findAGFromRequest(req)).toEqual('admin');
    done();
  });

  test('When custom access_group_search_path, should return user access group the custom path', (done) => {
    const req = { session: { user: { group: 'admin' } } };
    expect(findAGFromRequest(req, 'session.user.group')).toEqual('admin');
    done();
  });
});

describe('findAGPermission()', () => {
  test('Should return guest access group array', (done) => {
    expect(findAGPermission(accessPolicies, 'guest')).toEqual(accessPolicies[0].permissions);
    done();
  });

  test('When access group not exist, should return false', (done) => {
    expect(findAGPermission(accessPolicies, 'not_found_access_group')).toEqual(false);
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

  test('Should return permissions for /test', (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/test')).toEqual(permission);
    done();
  });

  test('When using prefix routes, should return permissions for /test', (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/api/v1/test', '/api/v1')).toEqual(
      permission
    );
    done();
  });

  test("When access group doesn't have permission, should return false ", (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/home')).toEqual(false);
    done();
  });

  test('When request path not found, should return false', (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, '/foo')).toEqual(false);
    done();
  });
});

describe('findMethodPermission()', () => {
  test('Should return permissions for GET /test', (done) => {
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

  test('When access policies method is *, should return permissions for * /test ', (done) => {
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

  test("Should return false when group don't have permission to this method", (done) => {
    expect(findRPPermission(accessPolicies[0].permissions, 'POST')).toEqual(false);
    done();
  });
});

describe('isAllowed()', () => {
  test('When action is allow, should return access policies for /test', (done) => {
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

  test('When action is deny, should return false', (done) => {
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
  test('Should return default deny object', (done) => {
    expect(deny()).toEqual({
      error: {
        status_code: 403,
        code: 'FORBIDDEN',
        message: 'Unauthorized Access',
      },
    });
    done();
  });

  test('When custom message is defined, should return deny object with custom message', (done) => {
    expect(deny('This is a custom message').error.message).toBe('This is a custom message');
    done();
  });
});
