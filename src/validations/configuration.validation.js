const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createConfiguration = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string().required(),
    value: Joi.string().required(),
  }),
};

const getAllConfigurations = {
  body: Joi.object().keys({
    // TODO - Recheck if we need this
    // name: Joi.string(),
    // code: Joi.string(),
    // value: Joi.string(),
  }),
};

const getConfigurations = {
  query: Joi.object().keys({
    name: Joi.string(),
    code: Joi.string(),
    value: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getConfiguration = {
  params: Joi.object().keys({
    configurationId: Joi.string().custom(objectId).required(),
  }),
};

const updateConfiguration = {
  params: Joi.object().keys({
    configurationId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      code: Joi.string(),
      value: Joi.string(),
    })
    .min(1),
};

const deleteConfiguration = {
  params: Joi.object().keys({
    configurationId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createConfiguration,
  getConfigurations,
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getAllConfigurations,
};
