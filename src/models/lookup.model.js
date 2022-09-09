const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const lookupSchema = mongoose.Schema(
  {
    category: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    code: {
      type: String,
      trim: true,
      required: true,
    },
    value: {
      type: String,
      trim: true,
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
lookupSchema.plugin(toJSON);
lookupSchema.plugin(paginate);

/**
 * @typedef Lookup
 */
const Lookup = mongoose.model('Lookup', lookupSchema);

module.exports = Lookup;
