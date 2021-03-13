'use strict';

const AccessControl = require('./access-control-schema');
const { findAGPermission, findRPPermission, findMethodPermission, isAllowed } = require('./common');

/**
 * This is the main function for Identity and Access Management middleware.
 * @param {Array} accessControl - The access control array or function.
 * @param {String} reqPath - The request path.
 * @param {String} reqMethod - The request method.
 * @param {String} accessGroup - The user access group.
 * @param {String} [prefix] - The base URL of your api. e.g. `api/v1`.
 * @returns {Boolean}
 */
const identityAccessManagement = (accessControl, reqPath, reqMethod, accessGroup, prefix = '') => {
  if (!accessControl || !reqPath || !reqMethod || !accessGroup) {
    return false;
  }

  if (typeof accessControl === 'function') {
    accessControl = accessControl();
    accessControl = AccessControl.validate({ access_control: accessControl });
  }

  const permissions = findAGPermission(accessControl, accessGroup);
  const reqPathPermission = permissions ? findRPPermission(permissions, reqPath, prefix) : false;
  const methodsArray = reqPathPermission
    ? findMethodPermission(reqPathPermission, reqMethod)
    : false;
  const cwt = methodsArray ? isAllowed(methodsArray) : false;

  return cwt ? true : false;
};

module.exports = identityAccessManagement;
