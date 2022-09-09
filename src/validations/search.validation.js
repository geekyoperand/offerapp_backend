const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSearch = {
  body: Joi.object().keys({
    value: Joi.string().required(),
  }),
};

const getSearches = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSearch = {
  params: Joi.object().keys({
    searchId: Joi.string().custom(objectId).required(),
  }),
};

const updateSearch = {
  params: Joi.object().keys({
    searchId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      value: Joi.string(),
    })
    .min(1),
};

const deleteSearch = {
  params: Joi.object().keys({
    searchId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createSearch,
  getSearches,
  getSearch,
  updateSearch,
  deleteSearch,
};
