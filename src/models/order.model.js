const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { orderStatus } = require('../constants');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
      required: true,
    },
    transactionId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Transaction',
    },
    status: {
      type: String,
      enum: Object.values(orderStatus),
      default: orderStatus.PAYMENT_PENDING,
      required: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    couponId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Coupon',
    },
    slotId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Item',
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
        discountedPrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmountWithoutDiscount: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
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
      min: 0,
      required: true,
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
    },
    feedback: {
      type: String,
      default: '',
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
orderSchema.plugin(toJSON);
orderSchema.plugin(aggregatePaginate);

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
