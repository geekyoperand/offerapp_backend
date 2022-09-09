const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const favoriteSchema = mongoose.Schema(
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
      default: false,
      required: true,
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
favoriteSchema.plugin(toJSON);
favoriteSchema.plugin(paginate);

/**
 * @typedef Favorite
 */
const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
