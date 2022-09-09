const mongoose = require('mongoose');
const { itemTypes } = require('../constants');
const { toJSON, paginate } = require('./plugins');

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    activeFrom: {
      type: Date,
      default: Date.now,
      required: true,
    },
    activeTill: {
      type: Date,
      default: null,
    },
    slug: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(itemTypes),
    },
    categoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
    },
    slotId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    extraCharges: {
      type: Number,
      default: 0,
    },
    initialQuantity: {
      type: Number,
      // required: true,
    },
    // couponSpecificKeywords: [
    //   {
    //     type: String,
    //     required: true,
    //   },
    // ],
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    specialDays: [
      {
        date: { type: Date, required: true },
        initialQuantity: {
          type: Number,
          required: true,
        },
        isQuantityDependent: {
          type: Boolean,
          default: false,
          required: true,
        },
        originalPrice: {
          type: Number,
          required: true,
        },
        currentPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    isQuantityDependent: {
      type: Boolean,
      default: false,
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
itemSchema.plugin(toJSON);
itemSchema.plugin(paginate);

/**
 * @typedef Item
 */
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
