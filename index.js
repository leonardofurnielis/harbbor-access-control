'use strict';

const AccessPolicies = require('./lib/access-policies-schema');
const iam = require('./lib/iam');
const { deny, findAGFromRequest } = require('./lib/helper');

const options = {};

/**
 * Express IAM middleware.
 */
const authorize = () => {
  return function (req, res, next) {
    const accessGroup = findAGFromRequest(req, options.access_group_search_path);
    const isAllowed = iam(
      options.access_policies,
      req.path,
      req.method,
      accessGroup,
      options.prefix
    );

    if (isAllowed) {
      next();
    } else {
      res.status(403).json(deny(options.custom_message));
    }
  };
};

/**
 * Express IAM configuration.
 * @param {Object} params
 * @param {String} [params.prefix] - The base URL of your api. e.g. `api/v1`.
 * @param {String} [params.default_access_group] - The default access_group to be assigned if no role defined.
 * @param {String} [params.custom_message] - The custom message when user is denied.
 * @param {String} [params.access_group_search_path] - The path in request object where access group resides.
 * @param {Array|Function} params.access_policies - The access policies array or function.
 */
const config = (params = {}) => {
  options.prefix = params.prefix || undefined;
  options.default_access_group = params.default_access_group || undefined;
  options.custom_message = params.custom_message || undefined;
  options.access_group_search_path = params.access_group_search_path || undefined;
  options.access_policies = AccessPolicies.validate(params);
};

module.exports = {
  config,
  authorize,
};
