const { providerTypes } = require('./auth');
const { couponTypes, couponQuanityTypes } = require('./coupon');
const { categoryTypes } = require('./category');
const { queryTicketTypes, queryTicketStatuses } = require('./queryticket');
const { fieldLanguages, fieldTypes } = require('./field');
const { itemTypes } = require('./item');
const { notificationTypes, notificationCategories } = require('./notification');
const { orderStatus } = require('./order');
const { otpTypes, otpModes } = require('./otp');
const { pointEarningTypes, pointTypesMessages } = require('./points');
const { referHistoryTypes, refferalTypesMessages } = require('./refferalhistory');
const { URL } = require('./regexexpressions');
const { tokenTypes } = require('./tokens');
const { paymentModes, paymentStatus } = require('./transaction');
const { roleTypes, genderTypes } = require('./user');

module.exports = {
  providerTypes,
  couponTypes,
  couponQuanityTypes,
  queryTicketTypes,
  queryTicketStatuses,
  fieldLanguages,
  fieldTypes,
  itemTypes,
  notificationTypes,
  orderStatus,
  pointEarningTypes,
  URL,
  tokenTypes,
  paymentModes,
  paymentStatus,
  roleTypes,
  genderTypes,
  otpTypes,
  otpModes,
  categoryTypes,
  notificationCategories,
  referHistoryTypes,
  refferalTypesMessages,
  pointTypesMessages,
};
