const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { paymentModes, paymentStatus, currency } = require('../constants');

const transactionSchema = mongoose.Schema(
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
    currency: { type: String, required: true, },
    gatewayName: {type: String,  },
    responseMessage: { type: String, required: true, },
    bankName: { type: String },
    paymentMode: { type: String },
    responseCode: { type: String, required: true },
    transactionId: { type: String, required: true },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    bankTransactionId: { type: String },
    status: {
      type: String,
      // enum: Object.values(paymentStatus),
      required: true,
    },
    shortOrderId: {
      type: String,
      required: true,
      unique: true
    },
    transactionDateTime: {
      type: Date,
      required: true
    },
    transactionDate: {
      type: Date,
      required: true
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
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
