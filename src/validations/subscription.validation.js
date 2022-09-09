const Joi = require('joi');

const createSubscription = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required().min(10).max(10).messages({
      'string.min': `Contact number cannot be less than 10 digits`,
      'string.max': `Contact number cannot be greater than 10 digits`,
    }),
  }),
};

module.exports = {
  createSubscription,
};
