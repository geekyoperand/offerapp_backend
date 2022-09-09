const Joi = require('joi');

const getServerStatus = {
  body: Joi.object().keys({}),
};

const getHomeDetails = {
  body: Joi.object().keys({}),
};

module.exports = {
  getHomeDetails,
  getServerStatus,
};
