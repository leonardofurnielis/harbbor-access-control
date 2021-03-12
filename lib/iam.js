'use strict';

const AccessPolicies = require('./access-policies-schema');
const { findAGPermission, findRPPermission, findMethodPermission, isAllowed } = require('./helper');

/**
 * This is the main function for Identity and Access Management middleware.
 * @param {Array} accessPolicies - The access policies array or function.
 * @param {String} reqPath - The request path.
 * @param {String} reqMethod - The request method.
 * @param {String} accessGroup - The user access group.
 * @param {String} [prefix] - The base URL of your api. e.g. `api/v1`.
 * @returns {Boolean}
 */
const identityAccessManagement = (accessPolicies, reqPath, reqMethod, accessGroup, prefix = '') => {
  if (!accessPolicies || !reqPath || !reqMethod || !accessGroup) {
    return false;
  }

  if (typeof accessPolicies === 'function') {
    accessPolicies = accessPolicies();
    accessPolicies = AccessPolicies.validate({ accessPolicies });
  }

  const permissions = findAGPermission(accessPolicies, accessGroup);
  const reqPathPermission = permissions ? findRPPermission(permissions, reqPath, prefix) : false;
  const methodsArray = reqPathPermission
    ? findMethodPermission(reqPathPermission, reqMethod)
    : false;
  const cwt = methodsArray ? isAllowed(methodsArray) : false;

  return cwt ? true : false;
};

module.exports = identityAccessManagement;
