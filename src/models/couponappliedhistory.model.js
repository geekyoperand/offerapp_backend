const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const couponAppliedHistorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Order',
      required: true,
    },
    couponId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Coupon',
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
couponAppliedHistorySchema.plugin(toJSON);
couponAppliedHistorySchema.plugin(paginate);

/**
 * @typedef CouponAppliedHistory
 */
const CouponAppliedHistory = mongoose.model('CouponAppliedHistory', couponAppliedHistorySchema);

module.exports = CouponAppliedHistory;
