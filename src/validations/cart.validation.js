const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCart = {
  body: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
    quantity: Joi.number().required().min(0),
    userId: Joi.string().custom(objectId).required(),
  }),
};

const applyWalletCash = {
  params: Joi.object().keys({
    applyCash: Joi.boolean().required(),
  }),
};

const getMyCart = {
  body: Joi.object().keys({}),
};

const emptyCart = {
  body: Joi.object().keys({}),
};

const getCarts = {
  query: Joi.object().keys({
    placeId: Joi.string().custom(objectId),
    userId: Joi.string().custom(objectId),
    couponId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId).required(),
  }),
};

const updateCart = {
  body: Joi.object()
    .keys({
      items: Joi.array()
        .items(
          Joi.object().keys({
            itemId: Joi.string().custom(objectId).required(),
            quantity: Joi.number(),
          })
        )
        .required(),
      placeId: Joi.string().custom(objectId).required(),
      slotId: Joi.string().custom(objectId).required(),
      couponId: Joi.string().custom(objectId),
      date: Joi.date().required(),
      applyCash: Joi.boolean().required(),
    })
    .min(1),
};

const deleteCart = {
  params: Joi.object().keys({
    cartId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = { applyWalletCash, createCart, getCarts, getCart, updateCart, deleteCart, getMyCart, emptyCart };
