const Joi = require('joi');
const { pointEarningTypes } = require('../constants');
const { objectId } = require('./custom.validation');

const createPointHistory = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    type: Joi.string()
      .valid(...Object.values(pointEarningTypes))
      .required(),
    points: Joi.number().required(),
    orderId: Joi.string()
      .custom(objectId)
      .when('pointEarningTypes', {
        is: Joi.any().valid(pointEarningTypes.BOOKING_CASHBACK, pointEarningTypes.BOOKING_WALLET_CASH),
        then: Joi.required(),
      }),
    placeId: Joi.string()
      .custom(objectId)
      .when('pointEarningTypes', {
        is: Joi.any().valid(pointEarningTypes.BOOKING_CASHBACK, pointEarningTypes.BOOKING_WALLET_CASH),
        then: Joi.required(),
      }),
  }),
};

const getPointHistories = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    type: Joi.string().valid(...Object.values(pointEarningTypes)),
    orderId: Joi.string().custom(objectId),
    placeId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPointHistory = {
  params: Joi.object().keys({
    pointHistoryId: Joi.string().custom(objectId).required(),
  }),
};

const updatePointHistory = {
  params: Joi.object().keys({
    pointHistoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      points: Joi.number(),
      orderId: Joi.string().custom(objectId),
      placeId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deletePointHistory = {
  params: Joi.object().keys({
    pointHistoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createPointHistory,
  getPointHistories,
  getPointHistory,
  updatePointHistory,
  deletePointHistory,
};
