'use strict';

const AccessPolicies = require('../../lib/access-policies-schema');

const accessPolicies = require('../mock/access-policies.json');

describe('AccessPoliciesSchema validate()', () => {
  test('When use correct schema, should return schema', () => {
    expect(AccessPolicies.validate({ access_policies: accessPolicies })).toEqual(accessPolicies);
  });

  test('When not found access policies arguments, should return error', () => {
    expect(AccessPolicies.validate).toThrow(TypeError);
  });

  test('When duplicated access group, should return error', () => {
    accessPolicies.push({
      access_group: 'admin',
      permissions: [
        {
          resource: '/home',
          methods: '*',
          action: 'allow',
        },
      ],
    });

    try {
      AccessPolicies.validate({ access_policies: accessPolicies });
    } catch (err) {
      expect(err.message).toEqual('"[2]" contains a duplicate value');
    }
  });

  test('When use function, should return function', () => {
    const accessPoliciesFunction = AccessPolicies.validate({ access_policies: () => {} });

    expect(typeof accessPoliciesFunction).toBe('function');
  });
});
