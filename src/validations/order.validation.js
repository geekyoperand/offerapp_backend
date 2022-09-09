const Joi = require('joi');
const { orderStatus } = require('../constants');
const { objectId } = require('./custom.validation');

const placeOrder = {
  body: Joi.object().keys({
    // placeId: Joi.string().custom(objectId).required(),
    // transactionId: Joi.string().custom(objectId),
    // status: Joi.string().valid(...Object.values(orderStatus)),
    // quantity: Joi.number().required().min(1),
    // userId: Joi.string().custom(objectId).required(),
    // couponId: Joi.string().custom(objectId),
    // totalAmount: Joi.number().min(0),
    // couponDiscount: Joi.number(),
    // pointsDiscount: Joi.number(),
    // tax: Joi.number(),
    // amountToBePaid: Joi.number().required(),
  }),
};

const postOrderRating = {
  body: Joi.object().keys({
    rating: Joi.number().required(),
    feedback: Joi.string().allow(null).allow(''),
    orderId: Joi.string().custom(objectId).required(),
  }),
};

const getPlaceOrders = {
  body: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
    // mode: Joi.string().valid(orderFilter),
    startdate: Joi.date(),
    enddate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    placeId: Joi.string().custom(objectId),
    status: Joi.string().valid(...Object.values(orderStatus)),
    userId: Joi.string().custom(objectId),
    couponId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOrder = {
  params: Joi.object().keys({ orderId: Joi.string().custom(objectId).required() }),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      placeId: Joi.string().custom(objectId),
      transactionId: Joi.string().custom(objectId),
      status: Joi.string().valid(...Object.values(orderStatus)),
      quantity: Joi.number().min(1),
      userId: Joi.string().custom(objectId),
      couponId: Joi.string().custom(objectId),
      totalAmount: Joi.number().min(0),
      couponDiscount: Joi.number(),
      pointsDiscount: Joi.number(),
      tax: Joi.number(),
      amountToBePaid: Joi.number(),
    })
    .min(1),
};

const deleteOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  placeOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getPlaceOrders,
  postOrderRating,
};
