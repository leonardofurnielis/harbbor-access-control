'use strict';

/* eslint-disable */

const joi = require('joi');

module.exports = (options) => {
  if (options.filename && options.path) {
    const policies = require(`${options.path}${options.filename}`);
    validate(policies);
    return policies;
  } else if (options.policies[0]) {
    validate(options.policies);
    return options.policies;
  } else {
    throw new Error('Can\'t find policies arguments');
  }
};

const policySchema = joi.object().keys({
  resource: joi.string().required(),
  methods: joi.any().required(),
  action: joi.string().regex(/(allow)|(deny)/).required()
});

const qSchema = joi.object().keys({
  group: joi.string().required(),
  permissions: joi.array().items(policySchema.required())
});

const schema = joi.array().items(qSchema.required());

function validate(policies) {
  const cwt = joi.validate(policies, schema);
  if (cwt.error) {
    throw new Error(JSON.stringify(cwt.error.details));
  }
}
