'use strict';

const assert = require('./lib/policies');
const access = require('./lib/access-control');
const { deny, findGroupFromRequest } = require('./lib/common');

const options = {};
const customize = {};

const authorize = () => {
  return function (req, res, next) {
    const group = findGroupFromRequest(req, customize.searchPath);
    const accesscontrol = access(options.policies, req.path, req.method, group, options.prefix);

    if (accesscontrol.isAllowed) {
      next();
    } else {
      res.status(403).json(deny(customize.customMessage));
    }
  };
};

const config = (opts = {}, ctz = {}) => {
  options.prefix = opts.prefix || undefined;
  options.policies = assert(opts);

  customize.customMessage = ctz.customMessage || undefined;
  customize.searchPath = ctz.searchPath || undefined;
};

module.exports = {
  config,
  authorize
};
