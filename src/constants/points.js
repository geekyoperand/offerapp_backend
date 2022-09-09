const pointEarningTypes = {
  REFFERED: 'REFFERED',
  BOOKING_CASHBACK: 'BOOKING_CASHBACK',
  BOOKING_WALLET_CASH: 'BOOKING_WALLET_CASH',
  // EXPIRED: 'EXPIRED',
};

const pointTypesMessages = {
  REFFERED: 'Refferal Bonus',
  BOOKING_CASHBACK: 'Cashback for your booking',
  // EXPIRED: 'Expired',
  BOOKING_WALLET_CASH: 'Paid for {{#place}}',
};

module.exports = {
  pointEarningTypes,
  pointTypesMessages,
};
