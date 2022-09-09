const mongoose = require('mongoose');
const { otpTypes } = require('../constants');
const { toJSON, paginate } = require('./plugins');
const { providerTypes } = require('../constants');

const otpSchema = mongoose.Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 10,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[0-9]/)) {
          throw new Error('Phone must be a valid 10 digit number');
        }
      },
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.EMAIL_PASSWORD,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(otpTypes),
      default: [otpTypes.REGISTER],
    },
    expiryTime: {
      type: String,
      required: true,
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
otpSchema.plugin(toJSON);
otpSchema.plugin(paginate);

/**
 * @typedef OTP
 */
const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
