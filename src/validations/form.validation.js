const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createForm = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string().required(),
  }),
};

const getForms = {
  query: Joi.object().keys({
    name: Joi.string(),
    code: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getForm = {
  params: Joi.object().keys({
    formId: Joi.string().custom(objectId).required(),
  }),
};

const updateForm = {
  params: Joi.object().keys({
    formId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      code: Joi.string(),
    })
    .min(1),
};

const getUIConfig = {
  body: Joi.object().keys({
    // TODO - Recheck if we need this
    // name: Joi.string(),
    // code: Joi.string(),
  }),
};

const deleteForm = {
  params: Joi.object().keys({
    formId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
  getUIConfig,
};
