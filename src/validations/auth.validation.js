const Joi = require('joi');
const { providerTypes, genderTypes, otpTypes } = require('../constants');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().min(10).max(10),
    otp: Joi.string().required().min(4).max(4),
    password: Joi.string().required().custom(password),
    email: Joi.string().email().required(),
    // location: Joi.string().required(),
  }),
};

const continueWithGoogle = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().min(10).max(10),
    otp: Joi.string().required().min(4).max(4),
    emailUpdates: Joi.boolean(),
    // location: Joi.string().required(),
    gender: Joi.string()
      .valid(...Object.values(genderTypes))
      .required(),
    referCode: Joi.string().min(6).max(10),
    googleIdToken: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
  }),
};

const googleRegister = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    referCode: Joi.string().min(6).max(10),
    phone: Joi.string().required().min(10).max(10),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const sendOtp = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().required().min(10).max(10),
    dateOfBirth: Joi.date(),
    googleIdToken: Joi.string(),
    email: Joi.string().email(),
    name: Joi.string(),
    provider: Joi.string()
      .required()
      .valid(...Object.values(providerTypes)),
    referCode: Joi.string().min(6).max(10),
    location: Joi.string(),
    gender: Joi.string().valid(...Object.values(genderTypes)),
    type: Joi.string()
      .required()
      .valid(...Object.values(otpTypes)),
  }),
};

const checkUser = {
  body: Joi.object().keys({
    googleIdToken: Joi.string().required(),
  }),
};

const updateProfileDetails = {
  body: Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      gender: Joi.string(),
      dateOfBirth: Joi.date().required(),
    })
    .min(1),
};

const addRequiredAccountDetails = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    gender: Joi.string()
      .valid(...Object.values(genderTypes))
      .required(),
    referCode: Joi.string().min(6).max(10),
    emailUpdates: Joi.boolean(),
    location: Joi.string(),
    dateOfBirth: Joi.date().required(),
  }),
};

const me = {
  query: Joi.object().keys({}),
};

const sendVerificationEmail = {
  body: Joi.object().keys({}),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleRegister,
  sendOtp,
  addRequiredAccountDetails,
  continueWithGoogle,
  sendVerificationEmail,
  checkUser,
  me,
  updateProfileDetails,
};
