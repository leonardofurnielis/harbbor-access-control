/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

'use strict';

const joi = require('joi');

const policieSchema = joi.object().keys({
  resource: joi.string().required(),
  methods: joi.any().required(),
  action: joi
    .string()
    .regex(/(allow)|(deny)/)
    .required(),
});

const groupSchema = joi.object().keys({
  group: joi.string().required(),
  permissions: joi.array().items(policieSchema.required()),
});

const schema = joi.array().items(groupSchema.required());

function validate(policies) {
  const cwt = joi.validate(policies, schema);
  if (cwt.error) {
    throw new Error(JSON.stringify(cwt.error.details));
  }
}

module.exports = options => {
  if (options.filename && options.path) {
    const policies = require(`${options.path}${options.filename}`);
    validate(policies);
    return policies;
  }
  if (options.policies[0]) {
    validate(options.policies);
    return options.policies;
  }
  throw new Error("Can't find policies arguments");
};
