const AWS = require('aws-sdk');
const client = require('../config/redis');
const { otpTypes } = require('../constants');
const { otpDBService } = require('../db');

const send = (params) => {
  return new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
};

const calculateExpiryTime = () => {
  const date = new Date();
  return new Date(date.setMinutes(date.getMinutes() + 10));
};

const verifyOTP = async (phoneNumber, otp, type, provider) => {
  let sentOTP = await client.get(`${type}-${phoneNumber}`);
  if (!sentOTP) {
    sentOTP = await otpDBService.getOTPsCount({
      phoneNumber,
      expiryTime: { $gte: new Date() },
      otp,
      type,
      provider,
    });
    return sentOTP === 1;
  }
  return sentOTP === otp;
};

const makeOtpInvalid = async (phoneNumber, type, provider) => {
  await client.set(`${type}-${phoneNumber}`, '');
  await otpDBService.updateOTP(
    {
      phoneNumber,
      type,
      provider,
    },
    {
      expiryTime: new Date(),
    }
  );
};

module.exports = {
  send,
  calculateExpiryTime,
  verifyOTP,
  makeOtpInvalid,
};
