const Joi = require('joi');
const { referHistoryTypes } = require('../constants');
const { objectId } = require('./custom.validation');

const createRefferalHistory = {
  body: Joi.object().keys({
    refferedUserId: Joi.string().custom(objectId).required(),
    userId: Joi.string().custom(objectId).required(),
    type: Joi.string().valid(...Object.values(referHistoryTypes)),
  }),
};

const getRefferalHistories = {
  query: Joi.object().keys({
    refferedUserId: Joi.string().custom(objectId),
    userId: Joi.string().custom(objectId),
    type: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getRefferalHistory = {
  params: Joi.object().keys({
    refferalHistoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateReffaralHistory = {
  params: Joi.object().keys({
    refferalHistoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      refferedUserId: Joi.string().custom(objectId),
      userId: Joi.string().custom(objectId),
      type: Joi.string(),
    })
    .min(1),
};

const deleteReffaralHistory = {
  params: Joi.object().keys({
    refferalHistoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createRefferalHistory,
  getRefferalHistories,
  getRefferalHistory,
  updateReffaralHistory,
  deleteReffaralHistory,
};
