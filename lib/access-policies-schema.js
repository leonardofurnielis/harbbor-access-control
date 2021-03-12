/* eslint-disable global-require */

'use strict';

const Joi = require('joi');

const accessPolicieSchema = Joi.object().keys({
  resource: Joi.string().required(),
  methods: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  action: Joi.string()
    .regex(/(allow)|(deny)/)
    .required(),
});

const accessGroupSchema = Joi.object().keys({
  access_group: Joi.string().required(),
  permissions: Joi.array().items(accessPolicieSchema.required()),
});

const schema = Joi.array().items(accessGroupSchema.required());

function validate(access_policies) {
  const cwt = Joi.validate(access_policies, schema);
  if (cwt.error) {
    throw new TypeError(JSON.stringify(cwt.error.details));
  }
}

module.exports.validate = (params) => {
  if (typeof params.access_policies === 'function') {
    console.warn(
      'Express IAM are using access policies from custom function, ensure that schema are correctly defined.'
    );
    return params.access_policie;
  }
  if (params.path) {
    const access_policies = require(params.path);
    validate(access_policies);
    return access_policies;
  }
  if (params.access_policies[0]) {
    validate(params.access_policies);
    return params.access_policies;
  }
  throw new TypeError(
    'Express IAM can not found access policies arguments, ensure that schema are correctly defined'
  );
};
