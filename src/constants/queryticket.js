const queryTicketTypes = {
  FEATURE_REQUEST: 'FEATURE_REQUEST',
  FEEDBACK: 'FEEDBACK',
  BUG: 'BUG',
  ORDER_RELATED: 'ORDER_RELATED',
  OTHER: 'OTHER',
};

const queryTicketStatuses = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  REMOVED: 'REMOVED',
};

const messageTypes = {
  TITLE: 'OPEN',
  DESCRIPTION: 'CLOSED',
  ORDER_ID: 'ORDER_ID',
  CATEGORY: 'CATEGORY',
  NORMAL_MESSAGE: 'NORMAL_MESSAGE',
};

module.exports = {
  queryTicketTypes,
  queryTicketStatuses,
  messageTypes,
};
