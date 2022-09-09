const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createLocationHistory = {
  body: Joi.object().keys({
    longitude: Joi.string().required(),
    latitude: Joi.string().required(),
    place: Joi.string().required(),
  }),
};

const getLocationHistories = {
  query: Joi.object().keys({
    longitude: Joi.string(),
    latitude: Joi.string(),
    place: Joi.string(),
    userId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getLocationHistory = {
  params: Joi.object().keys({
    locationHistoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateLocationHistory = {
  params: Joi.object().keys({
    locationHistoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      longitude: Joi.string(),
      latitude: Joi.string(),
      place: Joi.string(),
    })
    .min(1),
};

const deleteLocationHistory = {
  params: Joi.object().keys({
    locationHistoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createLocationHistory,
  getLocationHistories,
  getLocationHistory,
  updateLocationHistory,
  deleteLocationHistory,
};
