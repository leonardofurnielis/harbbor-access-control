'use strict';

const AccessPolicies = require('./lib/access-policies-schema');
const rbac = require('./lib/rbac');
const { deny, findGroupFromRequest } = require('./lib/helper');

const options = {};

const authorize = () => {
  return function (req, res, next) {
    const access_group = findGroupFromRequest(req, options.role_search_path);
    const accesscontrol = rbac(
      options.access_policies,
      req.path,
      req.method,
      access_group,
      options.prefix
    );

    if (accesscontrol.isAllowed) {
      next();
    } else {
      res.status(403).json(deny(options.custom_message));
    }
  };
};

const config = (params = {}) => {
  options.path = params.path || undefined;
  options.prefix = params.prefix || undefined;
  options.default_access_group = params.default_access_group || undefined;
  options.custom_message = params.custom_message || undefined;
  options.role_search_path = params.role_search_path || undefined;
  options.access_policies = AccessPolicies.validate(params);
};

module.exports = {
  config,
  authorize,
};
