const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createViewHistory = {
  body: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
};

const getViewHistories = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    placeId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getViewHistory = {
  params: Joi.object().keys({
    viewHistoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateViewHistory = {
  params: Joi.object().keys({
    viewHistoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      placeId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteViewHistory = {
  params: Joi.object().keys({
    viewHistoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createViewHistory,
  getViewHistories,
  getViewHistory,
  updateViewHistory,
  deleteViewHistory,
};
