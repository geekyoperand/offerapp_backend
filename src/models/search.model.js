const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const searchSchema = mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
    },
    searchCount: {
      type: Number,
      default: 1,
      required: true,
    },
    userIds: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
    ],
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
searchSchema.plugin(toJSON);
searchSchema.plugin(paginate);

/**
 * @typedef Search
 */
const Search = mongoose.model('Search', searchSchema);

module.exports = Search;
