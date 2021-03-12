'use strict';

const AccessPolicies = require('../../lib/access-policies-schema');

const accessPolicies = require('../mock/access-policies.json');

describe('AccessPoliciesSchema validate()', () => {
  test('When use correct schema, should return schema', () => {
    expect(AccessPolicies.validate({ access_policies: accessPolicies })).toEqual(accessPolicies);
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

    expect(AccessPolicies.validate()).toThrow();
  });
});
