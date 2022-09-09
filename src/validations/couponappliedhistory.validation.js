const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCouponAppliedHistory = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    orderId: Joi.string().custom(objectId).required(),
    couponId: Joi.string().custom(objectId).required(),
  }),
};

const getCouponAppliedHistories = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    orderId: Joi.string().custom(objectId),
    couponId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCouponAppliedHistory = {
  params: Joi.object().keys({
    couponAppliedHistoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateCouponAppliedHistory = {
  params: Joi.object().keys({
    couponAppliedHistoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      orderId: Joi.string().custom(objectId),
      couponId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteCouponAppliedHistory = {
  params: Joi.object().keys({
    couponAppliedHistoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createCouponAppliedHistory,
  getCouponAppliedHistories,
  getCouponAppliedHistory,
  updateCouponAppliedHistory,
  deleteCouponAppliedHistory,
};
