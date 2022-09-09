const mongoose = require('mongoose');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { toJSON, paginate } = require('./plugins');

const viewhistorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
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
viewhistorySchema.plugin(toJSON);
// viewhistorySchema.plugin(paginate);
viewhistorySchema.plugin(aggregatePaginate);

/**
 * @typedef ViewHistory
 */
const ViewHistory = mongoose.model('ViewHistory', viewhistorySchema);

module.exports = ViewHistory;
