const Joi = require('joi');
const { couponQuanityTypes, couponTypes } = require('../constants');
const { objectId } = require('./custom.validation');

const createCoupon = {
  body: Joi.object().keys({
    places: Joi.array().items(
      Joi.object().keys({
        placeId: Joi.string().custom(objectId).required(),
        slotId: Joi.string().custom(objectId).required(),
      })
    ),
    inactiveOn: Joi.array().items(Joi.date().required()),
    count: Joi.number().required(),
    code: Joi.string().required(),
    quantityType: Joi.string()
      .valid(...Object.values(couponQuanityTypes))
      .required(),
    isUsageLimit: Joi.boolean(),
    discountAmount: Joi.number(),
    maxDiscount: Joi.number().allow(null),
    minTickets: Joi.number(),
    activeFrom: Joi.date().required(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
    isActive: Joi.boolean(),
    isForFirstOrder: Joi.boolean(),
    maxTimes: Joi.number(),
    discountPercentage: Joi.number(),
    type: Joi.string()
      .valid(...Object.values(couponTypes))
      .required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    termsAndConditions: Joi.array().items(Joi.string().required()).required(),
    minCartValue: Joi.number().required(),
  }),
};

const getActiveCoupons = {
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    // isPlaceSpecific: Joi.boolean(),
    quantityType: Joi.string().valid(...Object.values(couponQuanityTypes)),
    isUsageLimit: Joi.boolean(),
    activeFrom: Joi.date(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
    isActive: Joi.boolean(),
    isForFirstOrder: Joi.boolean(),
    type: Joi.string().valid(...Object.values(couponTypes)),
  }),
};

const applyCoupon = {
  body: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

const removeCoupon = {
  body: Joi.object().keys({}),
};

const getCoupons = {
  query: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    // isPlaceSpecific: Joi.boolean(),
    quantityType: Joi.string().valid(...Object.values(couponQuanityTypes)),
    isUsageLimit: Joi.boolean(),
    activeFrom: Joi.date(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
    isActive: Joi.boolean(),
    isForFirstOrder: Joi.boolean(),
    type: Joi.string().valid(...Object.values(couponTypes)),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId).required(),
  }),
};

const updateCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      places: Joi.array().items(
        Joi.object().keys({
          placeId: Joi.string().custom(objectId).required(),
          slotId: Joi.string().custom(objectId).required(),
        })
      ),
      inactiveOn: Joi.array().items(Joi.date()),
      count: Joi.number(),
      code: Joi.string(),
      quantityType: Joi.string().valid(...Object.values(couponQuanityTypes)),
      isUsageLimit: Joi.boolean(),
      discountAmount: Joi.number(),
      maxDiscount: Joi.number().allow(null),
      minTickets: Joi.number(),
      activeFrom: Joi.date(),
      activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')).allow(null),
      isActive: Joi.boolean(),
      isForFirstOrder: Joi.boolean(),
      maxTimes: Joi.number(),
      discountPercentage: Joi.number(),
      type: Joi.string().valid(...Object.values(couponTypes)),
      name: Joi.string(),
      description: Joi.string(),
      termsAndConditions: Joi.array().items(Joi.string().required()),
      minCartValue: Joi.number(),
    })
    .min(1),
};

const deleteCoupon = {
  params: Joi.object().keys({
    couponId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons,
  applyCoupon,
  removeCoupon,
};
