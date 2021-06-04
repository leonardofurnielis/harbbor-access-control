'use strict';

const AccessControl = require('../../lib/access-control-schema');

const accessControl = require('../mock/access-control.json');

describe('AccessControlSchema validate()', () => {
  test('When use correct schema, should return schema', () => {
    expect(AccessControl.validate({ access_control: accessControl })).toEqual(accessControl);
  });

  test('When not found access control arguments, should return error', () => {
    expect(AccessControl.validate).toThrow(TypeError);
  });

  test('When duplicated access group, should return error', () => {
    accessControl.push({
      access_group: 'admin',
      permissions: [
        {
          path: '/home',
          methods: '*',
          action: 'allow',
        },
      ],
    });

    try {
      AccessControl.validate({ access_control: accessControl });
    } catch (err) {
      expect(err.message).toEqual('"[2]" contains a duplicate value');
    }
  });

  test('When use function, should return function', () => {
    const accessControlFunction = AccessControl.validate({ access_control: () => {} });

    expect(typeof accessControlFunction).toBe('function');
  });
});
