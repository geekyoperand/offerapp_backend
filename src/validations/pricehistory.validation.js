const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPriceHistory = {
  body: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
    entryFee: Joi.number().min(0).required(),
    managerId: Joi.string().custom(objectId).required(),
  }),
};

const getPriceHistories = {
  query: Joi.object().keys({
    placeId: Joi.string().custom(objectId),
    managerId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPriceHistory = {
  params: Joi.object().keys({
    priceHistoryId: Joi.string().custom(objectId).required(),
  }),
};

const updatePriceHistory = {
  params: Joi.object().keys({
    priceHistoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      placeId: Joi.string().custom(objectId),
      entryFee: Joi.number().min(0),
      managerId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deletePriceHistory = {
  params: Joi.object().keys({
    priceHistoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createPriceHistory,
  getPriceHistories,
  getPriceHistory,
  updatePriceHistory,
  deletePriceHistory,
};
