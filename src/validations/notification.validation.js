const Joi = require('joi');
const { notificationTypes, notificationCategories } = require('../constants');
const { objectId } = require('./custom.validation');

const createNotification = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    text: Joi.string().required(),
    type: Joi.string().valid(...Object.values(notificationTypes)),
    category: Joi.string().valid(...Object.values(notificationCategories)),
    orderId: Joi.string().custom(objectId),
    shortOrderId: Joi.string(),
    placeId: Joi.string().custom(objectId),
    dateTime: Joi.date(),
  }),
};

const markNotificationsAsRead = {
  body: Joi.object().keys({
    notificationIds: Joi.array().items(Joi.string().custom(objectId).required()).required(),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    text: Joi.string(),
    type: Joi.string().valid(...Object.values(notificationTypes)),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId).required(),
  }),
};

const sendNotificationUsers = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    data: Joi.defaults((schema) =>
      schema.options({
        allowUnknown: true,
      })
    )
      .object()
      .keys({
        page: Joi.string(),
        params: Joi.defaults((schema) =>
          schema.options({
            allowUnknown: true,
          })
        )
          .object()
          .keys({}),
      }),
    userIds: Joi.array().items(Joi.string().custom(objectId).required()).required().min(1),
  }),
};

const sendNotification = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    data: Joi.object().keys({
      page: Joi.string(),
      params: Joi.defaults((schema) =>
        schema.options({
          allowUnknown: true,
        })
      )
        .object()
        .keys({}),
    }),
  }),
};

const updateNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string().custom(objectId),
      text: Joi.string(),
      type: Joi.string().valid(...Object.values(notificationTypes)),
      category: Joi.string().valid(...Object.values(notificationCategories)),
      orderId: Joi.string().custom(objectId),
      shortOrderId: Joi.string(),
      placeId: Joi.string().custom(objectId),
      dateTime: Joi.date(),
    })
    .min(1),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  sendNotificationUsers,
  markNotificationsAsRead,
};
