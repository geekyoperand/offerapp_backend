const httpStatus = require('http-status');
const { Notification } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a notification
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody) => {
  return Notification.create(notificationBody);
};

/**
 * Query for notifications with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryNotifications = async (filter, options) => {
  const notifications = await Notification.paginate({ ...filter, isDeleted: false }, options);
  return notifications;
};

/**
 * find all notifications without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getNotifications = async (filter, keys, populate = []) => {
  const notifications = await Notification.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return notifications;
};

/**
 * Get notifications count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getNotificationsCount = async (filter) => {
  return Notification.countDocuments(filter);
};

/**
 * Get notification by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id, populate = []) => {
  return Notification.findById(id).populate(populate);
};

/**
 * Get notification with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Notification>}
 */
const getNotification = async (filter, populate = []) => {
  return Notification.findOne(filter).populate(populate);
};

/**
 * Update notification by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotification = async (filter, updateBody) => {
  const notification = await getNotification(filter);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  return Notification.updateOne(filter, updateBody);
};

/**
 * Update notifications by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotifications = async (filter, updateBody) => {
  return Notification.updateMany(filter, updateBody);
};

/**
 * Update notification by id
 * @param {ObjectId} notificationId
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotificationById = async (notificationId, updateBody) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  await Notification.findByIdAndUpdate(notificationId, updateBody);
  return notification;
};

/**
 * Delete notification by id
 * @param {ObjectId} notificationId
 * @param {Object} deleteBody
 * @returns {Promise<Notification>}
 */
const deleteNotificationById = async (notificationId, deleteBody) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  await Notification.findByIdAndUpdate(notificationId, { ...deleteBody, isDeleted: true });
  return notification;
};

module.exports = {
  createNotification,
  queryNotifications,
  getNotificationById,
  updateNotification,
  updateNotificationById,
  deleteNotificationById,
  getNotifications,
  getNotificationsCount,
  updateNotifications,
};
