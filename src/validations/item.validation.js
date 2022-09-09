const Joi = require('joi');
const { itemTypes } = require('../constants');
const { objectId } = require('./custom.validation');

const createItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    activeFrom: Joi.date().required(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')).allow(null),
    slug: Joi.string(),
    type: Joi.string()
      .valid(...Object.values(itemTypes))
      .required(),
    categoryId: Joi.string().custom(objectId),
    slotId: Joi.string().custom(objectId).required(),
    placeId: Joi.string().custom(objectId).required(),
    originalPrice: Joi.number().required(),
    currentPrice: Joi.number().required(),
    tax: Joi.number(),
    extraCharges: Joi.number(),
    initialQuantity: Joi.number().required(),
    // couponSpecificKeywords: Joi.array().items(Joi.string().required()),
    isActive: Joi.boolean(),
    specialDays: Joi.array().items(
      Joi.object().keys({
        date: Joi.date().required(),
        initialQuantity: Joi.number().required(),
        isQuantityDependent: Joi.boolean().required(),
        originalPrice: Joi.number().required(),
        currentPrice: Joi.number().required(),
      })
    ),
    isQuantityDependent: Joi.boolean().required(),
  }),
};

const getItems = {
  query: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    slug: Joi.string(),
    type: Joi.string().valid(...Object.values(itemTypes)),
    placeId: Joi.string().custom(objectId).required(),
    date: Joi.date().required(),
    slotId: Joi.string().custom(objectId).required(),
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
      activeFrom: Joi.date(),
      activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')).allow(null),
      slug: Joi.string(),
      type: Joi.string().valid(...Object.values(itemTypes)),
      categoryId: Joi.string().custom(objectId),
      slotId: Joi.string().custom(objectId),
      placeId: Joi.string().custom(objectId),
      originalPrice: Joi.number(),
      currentPrice: Joi.number(),
      tax: Joi.number(),
      extraCharges: Joi.number(),
      initialQuantity: Joi.number(),
      // couponSpecificKeywords: Joi.array().items(Joi.string().required()),
      isActive: Joi.boolean(),
      specialDays: Joi.array().items(
        Joi.object().keys({
          date: Joi.date().required(),
          initialQuantity: Joi.number().required(),
          isQuantityDependent: Joi.boolean().required(),
          originalPrice: Joi.number().required(),
          currentPrice: Joi.number().required(),
        })
      ),
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
