'use strict';

const iam = require('../../lib/iam');

const accessControl = require('../mock/access-control.json');

describe('identityAccessManagement()', () => {
  test('When user is authorized, should return true', () => {
    expect(iam(accessControl, '/api/test', 'GET', 'guest', '/api')).toEqual(true);
  });

  test('When arguments not found, should return false', () => {
    expect(iam(accessControl, undefined, 'GET', 'guest', '/api')).toEqual(false);
  });

  test('When use function, should return true', () => {
    expect(
      iam(
        () => {
          return accessControl;
        },
        '/api/test',
        'GET',
        'guest',
        '/api'
      )
    ).toEqual(true);
  });
});
