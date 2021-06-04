/*
 * express-iam
 * Copyright 2019-2021 Leonardo Furnielis.
 * Licensed under MIT License
 */

'use strict';

/**
 * @description This function validates whether the sent element was an array or not.
 * @param {String|Array} elementOrArray
 * @return {Array}
 */
const oneOrMany = (elementOrArray) => {
  return !elementOrArray || Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
};

/**
 * @description This function validates if the url matches with unless options.
 * @param {String} paths
 * @param {String} url
 * @return {Boolean}
 */
const isUrlMatch = (paths, url) => {
  let isMatch = typeof paths === 'string' && paths === url;

  if (paths && paths.path) {
    isMatch = isUrlMatch(paths.path, url);
  }
  return isMatch;
};

/**
 * @description This function validate if the method match with unless options.
 * @param {String} methods
 * @param {String} m
 * @return {Boolean}
 */
const isMethodMatch = (methods, m) => {
  if (!methods) {
    return true;
  }

  methods = oneOrMany(methods);

  return methods.indexOf(m) > -1;
};

/**
 * @description This function skips or doesn't skip a specific path.
 * @param {Object|Function} _middleware - Internal controller, this parameter must be ignored.
 * @param {Boolean} options
 * @param {Boolean} options.useOriginalUrl - If false, path will match against req.url instead of req.originalUrl.
 * @param {String|Array} options.paths
 * @param {String|Array} options.methods
 * @return {Function}
 */
module.exports = function unless(_middleware, options) {
  if (typeof options === 'undefined') {
    options = _middleware;
    _middleware = this;
  }

  const opts = options;
  opts.useOriginalUrl = typeof opts.useOriginalUrl === 'undefined' ? true : opts.useOriginalUrl;

  const unlessMiddleware = function (req, res, next) {
    const url = new URL(
      (opts.useOriginalUrl ? req.originalUrl : req.url) || req.url || '',
      `${req.protocol}://${req.hostname}`
    );

    let skip = false;

    const paths = oneOrMany(opts.paths);

    if (paths) {
      skip =
        skip ||
        paths.some((path) => {
          const methods = path.methods || oneOrMany(path.methods);
          return isUrlMatch(path, url.pathname) && isMethodMatch(methods, req.method);
        });
    }

    const methods = oneOrMany(opts.methods);

    if (methods) {
      skip = skip || methods.indexOf(req.method) > -1;
    }

    if (skip) {
      return next();
    }

    _middleware(req, res, next);
  };

  unlessMiddleware.unless = unless;

  return unlessMiddleware;
};
