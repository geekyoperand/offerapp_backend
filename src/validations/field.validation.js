const Joi = require('joi');
const { fieldTypes, fieldLanguages } = require('../constants');
const { objectId } = require('./custom.validation');

const createField = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    label: Joi.string().required(),
    defaultValue: Joi.string(),
    type: Joi.string()
      .valid(...Object.values(fieldTypes))
      .required(),
    minLength: Joi.alternatives().conditional('type', {
      is: 'TEXT',
      then: Joi.number().min(1).max(100).required(),
      otherwise: Joi.number().min(1).max(100),
    }),
    maxLength: Joi.alternatives().conditional('type', {
      is: 'TEXT',
      then: Joi.number().min(Joi.ref('minLength')).max(Joi.ref('minLength')).required(),
      otherwise: Joi.number().min(100),
    }),
    required: Joi.boolean(),
    language: Joi.string().valid(...Object.values(fieldLanguages)),
    formId: Joi.string().custom(objectId).required(),
  }),
};

const getFields = {
  query: Joi.object().keys({
    code: Joi.string(),
    label: Joi.string(),
    type: Joi.string().valid(...Object.values(fieldTypes)),
    required: Joi.boolean(),
    language: Joi.string().valid(...Object.values(fieldLanguages)),
    formId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getField = {
  params: Joi.object().keys({
    fieldId: Joi.string().custom(objectId).required(),
  }),
};

const updateField = {
  params: Joi.object().keys({
    fieldId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      code: Joi.string(),
      label: Joi.string(),
      defaultValue: Joi.string(),
      type: Joi.string().valid(...Object.values(fieldTypes)),
      minLength: Joi.alternatives().conditional('type', {
        is: 'TEXT',
        then: Joi.number().min(1).max(100).required(),
        otherwise: Joi.number().min(1).max(100),
      }),
      maxLength: Joi.alternatives().conditional('type', {
        is: 'TEXT',
        then: Joi.number().min(Joi.ref('minLength')).max(Joi.ref('minLength')).required(),
        otherwise: Joi.number().min(100),
      }),
      required: Joi.boolean(),
      language: Joi.string().valid(...Object.values(fieldLanguages)),
      formId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteField = {
  params: Joi.object().keys({
    fieldId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createField,
  getFields,
  getField,
  updateField,
  deleteField,
};
