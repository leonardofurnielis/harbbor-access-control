/*
 * express-iam
 * Copyright 2019-2021 Leonardo Furnielis.
 * Licensed under MIT License
 */

'use strict';

const objectPath = require('object-path');

/**
 * @description Transform the path string in array of tokens.
 * @param {String} path - The path.
 * @return {Array}
 */
const pathToArray = (path) => {
  if (typeof path !== 'string') {
    throw new TypeError('The value must be string');
  }
  return path.split('/');
};

/**
 * @description Find the access group from request.
 * @description  The default search path of access group is: `req.session.group`, `req.locals.group` or `req.group`.
 * @param {Object} req - The request object.
 * @param {String} [searchPath] - The path in request object where access group resides.
 * @return {String}
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
 * @description Find the access group permissions at access control.
 * @param {Array} accessControl - The access control array.
 * @param {String} accessGroup - The access group.
 * @return {Array}
 */
const findAGPermission = (accessControl, accessGroup) => {
  const permissionAccessGroup = accessControl.filter((f) => f.access_group === accessGroup);

  return permissionAccessGroup[0] ? permissionAccessGroup[0].permissions : false;
};

/**
 * @description Find the request path permissions at access control.
 * @param {Array} permissions - The permissions of access group.
 * @param {String} reqPath - The request path.
 * @param {String} [prefix] - The base URL of your api. e.g. `api/v1`.
 * @return {Array}
 */
const findRPPermission = (permissions, reqPath, prefix = '') => {
  const reqPathTokens = pathToArray(reqPath);
  const permissionPath = permissions.filter((f) => {
    const path = `${prefix}${f.path}`.split('/');
    let hasPermission = true;
    reqPathTokens.forEach((element, i) => {
      if (
        (element !== path[i] && path[i] !== '*' && path[i] !== undefined) ||
        reqPathTokens.length < path.length ||
        (path[i] === undefined && path[path.length - 1] !== '*')
      ) {
        hasPermission = false;
      }
    });
    return hasPermission;
  });

  return permissionPath[0] ? permissionPath : false;
};

/**
 * @description Find the method permissions at access control.
 * @param {Array} permissions - The permissions of access group.
 * @param {String} method - The request method.
 * @return {Array}
 */
const findMethodPermission = (permissions, method) => {
  let permissionMethod = permissions.filter((f) => f.methods.includes(method));

  const allMethods = permissions.filter((f) => f.methods === '*');

  if (permissionMethod[0] && permissionMethod[0].action === 'deny') {
    permissionMethod = false;
  } else if (!permissionMethod[0] && allMethods[0] && allMethods[0].action === 'allow') {
    permissionMethod = allMethods;
  }

  return permissionMethod[0] ? permissionMethod : false;
};

/**
 * @description Verify if the user is allowed or not the to access the requested path.
 * @param {Array} permissions - The permissions of access group.
 * @return {Array}
 */
const isAllowed = (permissions) => {
  const permissionAllowed = permissions.filter((f) => f.action === 'allow');

  return permissionAllowed[0] ? permissionAllowed : false;
};

/**
 * @description Creates the denied object when user is not allowed.
 * @param {Array} [customMessage] - The custom message when user is denied.
 * @return {Object}
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
