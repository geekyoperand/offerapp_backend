const notificationTypes = {
  USER_SPECIFIC: 'USER_SPECIFIC',
  EVERYONE: 'EVERYONE',
};

const notificationCategories = {
  PLACE_BOOKING: 'PLACE_BOOKING',
};

const notificationTexts = {
  PLACE_BOOKING:  "Your booking has been done successfully for {{#name}}"
}
module.exports = {
  notificationTypes,
  notificationCategories,
  notificationTexts
};
