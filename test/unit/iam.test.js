'use strict';

const iam = require('../../lib/iam');

const accessPolicies = require('../mock/access-policies.json');

describe('identityAccessManagement()', () => {
  test('When user is authorized, should return true', () => {
    expect(iam(accessPolicies, '/api/test', 'GET', 'guest', '/api')).toEqual(true);
  });

  test('When arguments not found, should return false', () => {
    expect(iam(accessPolicies, undefined, 'GET', 'guest', '/api')).toEqual(false);
  });

  test('When use function, should return true', () => {
    expect(
      iam(
        () => {
          return accessPolicies;
        },
        '/api/test',
        'GET',
        'guest',
        '/api'
      )
    ).toEqual(true);
  });
});
