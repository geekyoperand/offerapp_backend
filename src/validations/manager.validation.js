const Joi = require('joi');

const getPlace = {
  body: Joi.object().keys({}),
};

module.exports = {
  getPlace,
};
