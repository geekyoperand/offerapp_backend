const Joi = require('joi');
const { queryTicketTypes, queryTicketStatuses } = require('../constants');
const { objectId } = require('./custom.validation');

const createQueryTicket = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string()
      .valid(...Object.values(queryTicketTypes))
      .required(),
    orderId: Joi.alternatives().conditional('orderId', {
      is: queryTicketTypes.DISPUTE,
      then: Joi.string().custom(objectId).required(),
    }),
  }),
};

const addQueryTicketComment = {
  params: Joi.object().keys({
    queryTicketId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    text: Joi.string(),
    image: Joi.string(),
  }),
};

const getQueryTickets = {
  query: Joi.object().keys({
    title: Joi.string(),
    type: Joi.string().valid(...Object.values(queryTicketTypes)),
    orderId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const changeQueryTicketStatus = {
  params: Joi.object().keys({
    queryTicketId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid(...Object.values(queryTicketStatuses)),
    })
    .min(1),
};

const deleteQueryTicketComment = {
  params: Joi.object().keys({
    queryTicketId: Joi.string().custom(objectId).required(),
    commentId: Joi.string().custom(objectId).required(),
  }),
};

const getQueryTicket = {
  params: Joi.object().keys({
    queryTicketId: Joi.string().custom(objectId).required(),
  }),
};

const updateQueryTicket = {
  params: Joi.object().keys({
    queryTicketId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
    })
    .min(1),
};

const deleteQueryTicket = {
  params: Joi.object().keys({
    queryTicketId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createQueryTicket,
  addQueryTicketComment,
  getQueryTickets,
  getQueryTicket,
  updateQueryTicket,
  deleteQueryTicket,
  changeQueryTicketStatus,
  deleteQueryTicketComment,
};
