const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const pricehistorySchema = mongoose.Schema(
  {
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
      required: true,
    },
    entryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    managerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
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
pricehistorySchema.plugin(toJSON);
pricehistorySchema.plugin(paginate);

/**
 * @typedef PriceHistory
 */
const PriceHistory = mongoose.model('PriceHistory', pricehistorySchema);

module.exports = PriceHistory;
