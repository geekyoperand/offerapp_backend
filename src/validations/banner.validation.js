const Joi = require('joi');
const { objectId } = require('./custom.validation');
const { bannerTypes } = require('../constants/banner');

const createBanner = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    activeFrom: Joi.date().required(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
    link: Joi.string().uri(),
    slug: Joi.string(),
    image: Joi.string().uri().required(),
    type: Joi.string().valid(...Object.values(bannerTypes)),
    placeId: Joi.string().custom(objectId).required(),
    placeSelectedDate: Joi.date().required(),
    slotId: Joi.string().custom(objectId).required(),
    url: Joi.string().required()
  }),
};

const getActiveBanners = {
  body: Joi.object().keys({
    // TODO - Recheck if we need this
    // name: Joi.string(),
    // activeFrom: Joi.date(),
    // activeTill: Joi.date().min(Joi.ref('activeFrom')),
    // description: Joi.string(),
  }),
};

const getBanners = {
  query: Joi.object().keys({
    name: Joi.string(),
    activeFrom: Joi.date(),
    activeTill: Joi.date().min(Joi.ref('activeFrom')),
    description: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId).required(),
  }),
};

const updateBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      description: Joi.string(),
      activeFrom: Joi.date(),
      activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
      link: Joi.string().uri(),
      slug: Joi.string(),
      image: Joi.string().uri(),
      type: Joi.string().valid(...Object.values(bannerTypes)),
      placeId: Joi.string().custom(objectId).required(),
      placeSelectedDate: Joi.date().required(),
      slotId: Joi.string().custom(objectId).required(),
      url: Joi.string().required()
    })
    .min(1),
};

const deleteBanner = {
  params: Joi.object().keys({
    bannerId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createBanner,
  getBanners,
  getBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
};
