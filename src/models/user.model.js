const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { codeGenerator } = require('../utils/common');
const { providerTypes, roleTypes, genderTypes } = require('../constants');

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    uid: {
      type: String,
      required: true,
      trim: true,
    },
    cartId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Cart',
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      // default: genderTypes.MALE,
    },
    location: {
      type: String,
      // required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
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
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.USER,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.EMAIL_PASSWORD,
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
    points: {
      type: Number,
      default: 0,
      required: true,
    },
    avatarUrl: {
      type: String,
      // required: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    referCode: {
      type: String,
      trim: true,
      minlength: 6,
      unique: true,
      // required: true,
    },
    referBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      default: null,
    },
    emailUpdates: {
      type: Boolean,
      default: false,
      // required: true,
    },
    requireAccountDetails: {
      type: Boolean,
      default: true,
      required: true,
    },
    isBlackListed: {
      type: Boolean,
      default: false,
      required: true,
    },
    isTestUser: {
      type: Boolean,
    },
    dateOfBirth: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

/**
 * Fetch a unique refferal code
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.statics.generateReferralCode = async function () {
  let code = '';
  let found = 0;
  do {
    code = codeGenerator(6);
    found = await this.countDocuments({ referCode: code });
  } while (found);
  return code.toUpperCase();
};
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
