const referHistoryTypes = {
  JOINED: 'JOINED',
  FIRST_BOOKING: 'FIRST_BOOKING',
};

const refferalTypesMessages = {
  JOINED: '{{#name}} has made their first booking through dayout',
  FIRST_BOOKING: '{{#name}} joined dayout using your refferal code',
};

module.exports = {
  referHistoryTypes,
  refferalTypesMessages,
};
