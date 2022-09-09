const Joi = require('joi');
const { paymentModes, paymentStatus } = require('../constants');
const { objectId } = require('./custom.validation');

const createTransaction = {
  body: Joi.object().keys({
    // userId: Joi.string().custom(objectId).required(),
    // orderId: Joi.string().custom(objectId).required(),
    // paymentMode: Joi.string().valid(...Object.values(paymentModes)),
    // amount: Joi.number().min(0).required(),
    // status: Joi.string()
    //   .valid(...Object.values(paymentStatus))
    //   .required(),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    orderId: Joi.string().custom(objectId),
    paymentMode: Joi.string().valid(...Object.values(paymentModes)),
    status: Joi.string().valid(...Object.values(paymentStatus)),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId).required(),
  }),
};

const updateTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      orderId: Joi.string().custom(objectId),
      paymentMode: Joi.string().valid(...Object.values(paymentModes)),
      amount: Joi.number().min(0),
      status: Joi.string().valid(...Object.values(paymentStatus)),
    })
    .min(1),
};

const deleteTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
