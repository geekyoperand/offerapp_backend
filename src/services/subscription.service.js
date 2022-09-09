const { Subscription } = require('../models');
/**
 * Create a subscription
 * @param {Object} subscriptionBody
 * @returns {Promise<Subscription>}
 */
const createSubscription = async (subscriptionBody) => {
  const subscription = await Subscription.create(subscriptionBody);
  return subscription;
};

module.exports = {
  createSubscription,
};
