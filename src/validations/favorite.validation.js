const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createFavorite = {
  body: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
};

const getFavorites = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    placeId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAllFavorites = {
  query: Joi.object().keys({}),
};

const getFavorite = {
  params: Joi.object().keys({
    favoriteId: Joi.string().custom(objectId).required(),
  }),
};

const updateFavorite = {
  params: Joi.object().keys({
    favoriteId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      placeId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteFavorite = {
  params: Joi.object().keys({
    favoriteId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createFavorite,
  getFavorites,
  getFavorite,
  updateFavorite,
  deleteFavorite,
  getAllFavorites,
};
