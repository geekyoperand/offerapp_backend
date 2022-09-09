const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { referHistoryTypes } = require('../constants');

const refferalhistorySchema = mongoose.Schema(
  {
    refferedUserId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(referHistoryTypes),
      required: true,
      default: referHistoryTypes.JOINED,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      // required: true,
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
refferalhistorySchema.plugin(toJSON);
refferalhistorySchema.plugin(paginate);

/**
 * @typedef RefferalHistory
 */
const RefferalHistory = mongoose.model('RefferalHistory', refferalhistorySchema);

module.exports = RefferalHistory;
