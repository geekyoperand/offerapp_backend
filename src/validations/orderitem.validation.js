const Joi = require('joi');
const { itemTypes } = require('../constants');
const { objectId } = require('./custom.validation');

const createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    slug: Joi.string(),
    type: Joi.string()
      .valid(...Object.values(itemTypes))
      .required(),
    price: Joi.number().required(),
    initialQuantity: Joi.number().required(),
    remainingQuantity: Joi.number().required(),
    isQuantityDependent: Joi.boolean().required(),
  }),
};

const getItems = {
  query: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    slug: Joi.string(),
    type: Joi.string().valid(...Object.values(itemTypes)),
    price: Joi.number(),
    initialQuantity: Joi.number(),
    remainingQuantity: Joi.number(),
    isQuantityDependent: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId).required(),
  }),
};

const updateItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      slug: Joi.string(),
      type: Joi.string().valid(...Object.values(itemTypes)),
      price: Joi.number(),
      initialQuantity: Joi.number(),
      remainingQuantity: Joi.number(),
      isQuantityDependent: Joi.boolean(),
    })
    .min(1),
};

const deleteItem = {
  params: Joi.object().keys({
    itemId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
};
