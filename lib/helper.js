'use strict';

const objectPath = require('object-path');

/**
 * Transform the path string in array of tokens.
 * @param {String} path - The path.
 * @returns {Array}
 */
const pathToArray = (path) => {
  if (typeof path !== 'string') {
    throw new TypeError('The value must be string');
  }
  return path.split('/');
};

/**
 * Find the access group from request.
 * By default this function will search access group at `req.session.group`, `req.locals.group` or `req.group`.
 * @param {Object} req - The request object.
 * @param {String} [searchPath] - The path in request object where access group resides.
 * @returns {String}
 */
const findAGFromRequest = (req, searchPath) => {
  if (searchPath && objectPath.get(req, searchPath)) {
    return objectPath.get(req, searchPath);
  }

  if (req.session && req.session.group) {
    return objectPath.get(req, 'session.group');
  }

  if (req.locals && req.locals.group) {
    return objectPath.get(req, 'locals.group');
  }

  if (req.group) {
    return req.group;
  }

  return 'guest';
};

/**
 * Find the access group permissions at access policies.
 * @param {Array} accessPolicies - The access policies array.
 * @param {String} accessGroup - The access group.
 * @returns {Array}
 */
const findAGPermission = (accessPolicies, accessGroup) => {
  const permissionAccessGroup = accessPolicies.filter((f) => f.access_group === accessGroup);

  return permissionAccessGroup[0] ? permissionAccessGroup[0].permissions : false;
};

/**
 * Find the request path permissions at access policies.
 * @param {Array} permissions - The permissions of access group.
 * @param {String} reqPath - The request path.
 * @param {String} [prefix] - The base URL of your api. e.g. `api/v1`.
 * @returns {Array}
 */
const findRPPermission = (permissions, reqPath, prefix = '') => {
  const reqPathTokens = pathToArray(reqPath);
  const permissionPath = permissions.filter((f) => {
    const resource = `${prefix}${f.resource}`.split('/');
    let hasPermission = true;
    reqPathTokens.forEach((element, i) => {
      if (
        (element !== resource[i] && resource[i] !== '*' && resource[i] !== undefined) ||
        reqPathTokens.length < resource.length ||
        (resource[i] === undefined && resource[resource.length - 1] !== '*')
      ) {
        hasPermission = false;
      }
    });
    return hasPermission;
  });

  return permissionPath[0] ? permissionPath : false;
};

/**
 * Find the method permissions at access policies.
 * @param {Array} permissions - The permissions of access group.
 * @param {String} method - The request method.
 * @returns {Array}
 */
const findMethodPermission = (permissions, method) => {
  const permissionMethod = permissions.filter(
    (f) => f.methods.includes(method) || f.methods === '*'
  );

  return permissionMethod[0] ? permissionMethod : false;
};

/**
 * Verify if the user is allowed or not the to access the requested path.
 * @param {Array} permissions - The permissions of access group.
 * @returns {Array}
 */
const isAllowed = (permissions) => {
  const permissionAllowed = permissions.filter((f) => f.action === 'allow');

  return permissionAllowed[0] ? permissionAllowed : false;
};

/**
 * Creates the denied object when user is not allowed.
 * @param {Array} [customMessage] - The custom message when user is denied.
 * @returns {Object}
 */
const deny = (customMessage) => {
  return {
    error: {
      status_code: 403,
      code: 'FORBIDDEN',
      message: customMessage || 'Unauthorized Access',
    },
  };
};

module.exports = {
  pathToArray,
  findAGFromRequest,
  findAGPermission,
  findRPPermission,
  findMethodPermission,
  isAllowed,
  deny,
};
