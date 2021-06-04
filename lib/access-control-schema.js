/*
 * express-iam
 * Copyright 2019-2021 Leonardo Furnielis.
 * Licensed under MIT License
 */

/* eslint-disable global-require */

'use strict';

const Joi = require('joi');

const accessControlSchema = Joi.object().keys({
  path: Joi.string().required(),
  methods: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  action: Joi.string()
    .regex(/(allow)|(deny)/)
    .required(),
});

const accessGroupSchema = Joi.object().keys({
  access_group: Joi.string().required(),
  permissions: Joi.array().items(accessControlSchema.required()),
});

const schema = Joi.array()
  .unique((a, b) => a.access_group === b.access_group)
  .items(accessGroupSchema.required());

/**
 * @description This function validate the access polices schema.
 * @param {Array} accessControl - The access control array or function.
 */
function validate(accessControl) {
  const cwt = schema.validate(accessControl);
  if (cwt.error) {
    throw new TypeError(cwt.error.message);
  }
}

/**
 * @description This function orchestrate the validation access polices schema.
 * @description It could be a function for real time validation. The user must ensure that schema are correctly defined.
 * @param {Object} params
 * @param {Array} params.access_control - The access control array or function.
 * @return {Boolean}
 */
module.exports.validate = (params) => {
  if (params && typeof params.access_control === 'function') {
    console.warn(
      'Express IAM are using access control from custom function, ensure that schema are correctly defined.'
    );
    return params.access_control;
  }
  if (params && params.access_control[0]) {
    validate(params.access_control);
    return params.access_control;
  }

  throw new TypeError(
    'Express IAM can not found access control arguments, ensure that schema are correctly defined'
  );
};
