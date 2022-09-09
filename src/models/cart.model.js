const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const cartSchema = mongoose.Schema(
  {
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
    },
    slotId: {
      type: mongoose.SchemaTypes.ObjectId,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    couponId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Coupon',
    },
    items: {
      type: [
        {
          itemId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Item',
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      default: [],
    },
    date: {
      type: Date,
      default: null,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      required: true,
    },
    totalAmountWithoutDiscount: {
      type: Number,
      default: 0,
      required: true,
    },
    pointsDiscount: {
      type: Number,
      default: 0,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
      required: true,
    },
    amountToBePaid: {
      type: Number,
      default: 0,
      min: 0,
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
cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
