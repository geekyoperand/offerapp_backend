const mongoose = require('mongoose');
const { pointEarningTypes } = require('../constants');
const { toJSON, paginate } = require('./plugins');

const pointhistorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(pointEarningTypes),
      required: true,
    },
    points: {
      type: Number,
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
pointhistorySchema.plugin(toJSON);
pointhistorySchema.plugin(paginate);

/**
 * @typedef PointHistory
 */
const PointHistory = mongoose.model('PointHistory', pointhistorySchema);

module.exports = PointHistory;
