const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { providerTypes, genderTypes } = require('../constants');

const registerRegisterUserTrackingTrackingSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.EMAIL_PASSWORD,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
    },
    location: {
      type: String,
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
    dateOfBirth: {
      type: Date,
      required: true,
    },
    referCode: {
      type: String,
      trim: true,
      minlength: 6,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'RegisterUserTracking',
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'RegisterUserTracking',
    },
    deletedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'RegisterUserTracking',
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
registerRegisterUserTrackingTrackingSchema.plugin(toJSON);
registerRegisterUserTrackingTrackingSchema.plugin(paginate);

registerRegisterUserTrackingTrackingSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
/**
 * @typedef RegisterUserTracking
 */
const RegisterUserTracking = mongoose.model('RegisterUserTracking', registerRegisterUserTrackingTrackingSchema);

module.exports = RegisterUserTracking;
