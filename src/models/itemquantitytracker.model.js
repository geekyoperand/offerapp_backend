const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const itemQuantityTrackerSchema = mongoose.Schema(
  {
    itemId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Item',
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
    },
    date: {
      type: Date,
      required: true,
    },
    slotId: {
      type: mongoose.SchemaTypes.ObjectId,
    },
    remainingQuantity: {
      type: Number,
      required: true,
      default: 0,
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
itemQuantityTrackerSchema.plugin(toJSON);
itemQuantityTrackerSchema.plugin(paginate);

/**
 * @typedef Item
 */
const ItemQuantityTracker = mongoose.model('ItemQuantityTracker', itemQuantityTrackerSchema);

module.exports = ItemQuantityTracker;
