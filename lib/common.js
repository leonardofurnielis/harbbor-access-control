'use strict';

const objectPath = require('object-path');

const pathToArray = path => {
  if (typeof path !== 'string') {
    throw new Error('Only string arguments are allowed');
  }
  return path.split('/');
};

const findGroupFromRequest = (req, searchPath) => {
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

const findPermissionForGroup = (policies, group) => {
  const permissionGroup = policies.filter(p => p.group === group);

  return permissionGroup[0] ? permissionGroup : false;
};

const findPermissionForRoute = (policies, route, prefix = '') => {
  const routeArray = pathToArray(route);
  const permissionRoute = policies[0].permissions.filter(p => {
    const accessuri = `${prefix}${p.resource}`.split('/');
    let hasPermission = true;
    routeArray.forEach((item, i) => {
      if (
        (item !== accessuri[i] && accessuri[i] !== '*' && accessuri[i] !== undefined) ||
        routeArray.length < accessuri.length ||
        (accessuri[i] === undefined && accessuri[accessuri.length - 1] !== '*')
      ) {
        hasPermission = false;
      }
    });
    return hasPermission;
  });

  return permissionRoute[0] ? permissionRoute : false;
};

const findPermissionForMethod = (policies, method) => {
  const permissionMethod = policies.filter(p => p.methods.includes(method) || p.methods === '*');

  return permissionMethod[0] ? permissionMethod : false;
};

const deny = customMessage => {
  return {
    error: {
      code: 403,
      message: 'FORBIDDEN',
      details: customMessage || 'Unauthorized access',
    },
  };
};

const isAllowed = policies => {
  const permissionAllowed = policies.filter(p => p.action === 'allow');

  return permissionAllowed[0] ? permissionAllowed : false;
};

module.exports = {
  pathToArray,
  findGroupFromRequest,
  findPermissionForGroup,
  findPermissionForRoute,
  findPermissionForMethod,
  deny,
  isAllowed,
};
