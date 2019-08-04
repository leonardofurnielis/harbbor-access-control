'use strict';

const {
  findPermissionForGroup,
  findPermissionForRoute,
  findPermissionForMethod,
  isAllowed
} = require('./common');

/**
 * @param {Array} policies
 * @param {String} route
 * @param {String} method
 * @param {String} group
 * @param {String} [prefix]
 * @returns {Object}
 */
const checkIfHasAccess = (policies, route, method, group, prefix = '') => {
  if (!policies || !route || !method || !group) {
    return { isAllowed: false };
  }

  const groupArray = findPermissionForGroup(policies, group);
  const routesArray = groupArray ? findPermissionForRoute(groupArray, route, prefix) : false;
  const methodsArray = routesArray ? findPermissionForMethod(routesArray, method) : false;
  const cwt = methodsArray ? isAllowed(methodsArray) : false;

  return cwt ? { isAllowed: true } : { isAllowed: false };
};

module.exports = checkIfHasAccess;
