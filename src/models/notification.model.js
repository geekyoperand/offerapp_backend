const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { notificationTypes, notificationCategories } = require('../constants');

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(notificationCategories),
      default: notificationCategories.PLACE_BOOKING,
      required: true,
    },
    orderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Order',
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
    },
    dateTime: {
      type: Date,
      default: new Date(),
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: Object.values(notificationTypes),
      default: notificationTypes.USER_SPECIFIC,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    deletedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
