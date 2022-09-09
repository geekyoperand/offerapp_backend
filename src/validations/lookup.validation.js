const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createLookup = {
  body: Joi.object().keys({
    category: Joi.string().required(),
    description: Joi.string().required(),
    code: Joi.string().required(),
    value: Joi.string().required(),
  }),
};

const getAllLookups = {
  query: Joi.object().keys({
    // TODO - Recheck if we need this
    // category: Joi.string(),
    // description: Joi.string(),
    // code: Joi.string(),
    // value: Joi.string(),
  }),
};

const getLookups = {
  query: Joi.object().keys({
    category: Joi.string(),
    description: Joi.string(),
    code: Joi.string(),
    value: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLookup = {
  params: Joi.object().keys({
    lookupId: Joi.string().custom(objectId).required(),
  }),
};

const updateLookup = {
  params: Joi.object().keys({
    lookupId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      category: Joi.string(),
      description: Joi.string(),
      code: Joi.string(),
      value: Joi.string(),
    })
    .min(1),
};

const deleteLookup = {
  params: Joi.object().keys({
    lookupId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createLookup,
  getLookups,
  getLookup,
  updateLookup,
  deleteLookup,
  getAllLookups,
};
