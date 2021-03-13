'use strict';

const {
  pathToArray,
  findAGFromRequest,
  findAGPermission,
  findRPPermission,
  findMethodPermission,
  isAllowed,
  deny,
} = require('../../lib/common');

const accessControl = require('../mock/access-control.json');

describe('pathToArray()', () => {
  test('Should return tokens', () => {
    expect(pathToArray('api/v1/test')).toEqual(['api', 'v1', 'test']);
  });

  test('When arguments is not type string, should return error', () => {
    try {
      pathToArray(100);
    } catch (err) {
      expect(err.message).toEqual('The value must be string');
    }
  });
});

describe('findAGFromRequest()', () => {
  test('When access group not found, should return default access group', () => {
    const req = {};
    expect(findAGFromRequest(req)).toEqual('guest');
  });

  test('Should return user access group from request at req.session.group', () => {
    const req = { session: { group: 'admin' } };
    expect(findAGFromRequest(req)).toEqual('admin');
  });

  test('Should return user access group from request at req.locals.group', () => {
    const req = { locals: { group: 'admin' } };
    expect(findAGFromRequest(req)).toEqual('admin');
  });

  test('Should return user access group from request at req.group', () => {
    const req = { group: 'admin' };
    expect(findAGFromRequest(req)).toEqual('admin');
  });

  test('When custom access_group_search_path, should return user access group the custom path', () => {
    const req = { session: { user: { group: 'admin' } } };
    expect(findAGFromRequest(req, 'session.user.group')).toEqual('admin');
  });
});

describe('findAGPermission()', () => {
  test('Should return guest access group array', () => {
    expect(findAGPermission(accessControl, 'guest')).toEqual(accessControl[0].permissions);
  });

  test('When access group not exist, should return false', () => {
    expect(findAGPermission(accessControl, 'not_found_access_group')).toEqual(false);
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

  test('Should return permissions for /test', () => {
    expect(findRPPermission(accessControl[0].permissions, '/test')).toEqual(permission);
  });

  test('When using prefix routes, should return permissions for /test', () => {
    expect(findRPPermission(accessControl[0].permissions, '/api/v1/test', '/api/v1')).toEqual(
      permission
    );
  });

  test("When access group doesn't have permission, should return false ", () => {
    expect(findRPPermission(accessControl[0].permissions, '/home')).toEqual(false);
  });

  test('When request path not found, should return false', () => {
    expect(findRPPermission(accessControl[0].permissions, '/foo')).toEqual(false);
  });
});

describe('findMethodPermission()', () => {
  test('Should return permissions for GET /test', () => {
    const permission = [
      {
        resource: '/test',
        methods: ['GET'],
        action: 'allow',
      },
    ];
    expect(findMethodPermission(permission, 'GET')).toEqual(permission);
  });

  test('When access control method is *, should return permissions for * /test', () => {
    const permission = [
      {
        resource: '/test',
        methods: '*',
        action: 'allow',
      },
    ];
    expect(findMethodPermission(permission, 'POST')).toEqual(permission);
  });

  test("Should return false when group don't have permission to this method", () => {
    expect(findRPPermission(accessControl[0].permissions, 'POST')).toEqual(false);
  });

  test('When multiple permission and deny specific method, should return false', () => {
    const permission = [
      {
        resource: '/test/1',
        methods: '*',
        action: 'allow',
      },
      {
        resource: '/test/1',
        methods: 'UPDATE',
        action: 'deny',
      },
    ];
    expect(findMethodPermission(permission, 'UPDATE')).toEqual(false);
  });

  test('When multiple permission allow all methods, should return permission for * /test', () => {
    const permission = [
      {
        resource: '/test/1',
        methods: '*',
        action: 'allow',
      },
      {
        resource: '/test/1',
        methods: 'UPDATE',
        action: 'deny',
      },
    ];

    expect(findMethodPermission(permission, 'GET')).toEqual([permission[0]]);
  });

  test('When multiple permission and allow specific method, should return permission for UPDATE /test/1', () => {
    const permission = [
      {
        resource: '/test/1',
        methods: '*',
        action: 'deny',
      },
      {
        resource: '/test/1',
        methods: 'UPDATE',
        action: 'allow',
      },
    ];

    expect(findMethodPermission(permission, 'UPDATE')).toEqual([permission[1]]);
  });

  test('When multiple permission deny all methods, should return false', () => {
    const permission = [
      {
        resource: '/test/1',
        methods: '*',
        action: 'deny',
      },
      {
        resource: '/test/1',
        methods: 'UPDATE',
        action: 'allow',
      },
    ];

    // console.log('>>', findMethodPermission(permission, 'GET'));
    expect(findMethodPermission(permission, 'GET')).toEqual(false);
  });
});

describe('isAllowed()', () => {
  test('When action is allow, should return access control for /test', () => {
    const permission = [
      {
        resource: '/test',
        methods: ['GET'],
        action: 'allow',
      },
    ];
    expect(isAllowed(permission)).toEqual(permission);
  });

  test('When action is deny, should return false', () => {
    const permission = [
      {
        resource: '/test',
        methods: '*',
        action: 'deny',
      },
    ];
    expect(isAllowed(permission)).toEqual(false);
  });
});

describe('deny()', () => {
  test('Should return default deny object', () => {
    expect(deny()).toEqual({
      error: {
        status_code: 403,
        code: 'FORBIDDEN',
        message: 'Unauthorized Access',
      },
    });
  });

  test('When custom message is defined, should return deny object with custom message', () => {
    expect(deny('This is a custom message').error.message).toBe('This is a custom message');
  });
});
