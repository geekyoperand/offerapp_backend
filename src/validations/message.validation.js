const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMessage = {
  body: Joi.object().keys({
    code: Joi.string().required(),
    text: Joi.string().required(),
  }),
};

const getAllMessages = {
  query: Joi.object().keys({
    // TODO - Recheck if we need this
    // code: Joi.string(),
    // text: Joi.string(),
  }),
};

const getMessages = {
  query: Joi.object().keys({
    code: Joi.string(),
    text: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMessage = {
  params: Joi.object().keys({
    messageId: Joi.string().custom(objectId).required(),
  }),
};

const updateMessage = {
  params: Joi.object().keys({
    messageId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      code: Joi.string(),
      text: Joi.string(),
    })
    .min(1),
};

const deleteMessage = {
  params: Joi.object().keys({
    messageId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  getAllMessages,
};
