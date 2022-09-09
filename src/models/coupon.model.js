const mongoose = require('mongoose');
const { couponTypes, couponQuanityTypes } = require('../constants');
const { toJSON, paginate } = require('./plugins');

const couponSchema = mongoose.Schema(
  {
    places: [
      {
        placeId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Place',
        },
        slotId: {
          type: mongoose.SchemaTypes.ObjectId,
        },
      },
    ],
    inactiveOn: { type: [Date], default: [] },
    initialCount: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    quantityType: {
      type: String,
      enum: Object.values(couponQuanityTypes),
      default: couponQuanityTypes.LIMITED,
      required: true,
    },
    isUsageLimit: {
      type: Boolean,
      default: false,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
      default: null,
    },
    minTickets: {
      type: Number,
      // required: true,
      min: 0,
      default: 1,
    },
    // couponItemKeywords: {
    //   type: [String],
    //   // required: true,
    //   default: [],
    // },
    activeFrom: {
      type: Date,
      default: Date.now,
      required: true,
    },
    activeTill: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    isForFirstOrder: {
      type: Boolean,
      default: false,
      // required: true,
    },
    maxTimes: {
      type: Number,
      default: 1,
      // required: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(couponTypes),
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    termsAndConditions: {
      type: [{ type: String, required: true }],
      required: true,
    },
    minCartValue: {
      type: Number,
      default: 0,
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
couponSchema.plugin(toJSON);
couponSchema.plugin(paginate);

couponSchema.pre('validate', async function (next) {
  const coupon = this;
  if (coupon.activeTill && coupon.activeFrom > coupon.activeTill) {
    next(new Error('active till must be greater than active from'));
  }
  next();
});

/**
 * @typedef Coupon
 */
const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
