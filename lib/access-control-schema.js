/* eslint-disable global-require */

'use strict';

const Joi = require('joi');

const accessControlSchema = Joi.object().keys({
  resource: Joi.string().required(),
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

function validate(access_control) {
  const cwt = schema.validate(access_control);
  if (cwt.error) {
    throw TypeError(cwt.error.message);
  }
}

/**
 * This function validate the access polices schema.
 * It could be a function, and will be validated in real time. By the way the user must ensure that schema are correctly defined.
 * @param {Object} params
 * @param {Array} params.access_control - The access control array or function.
 * @returns {Boolean}
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
