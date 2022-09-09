const httpStatus = require('http-status');
const { Message } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');
/**
 * Create a message
 * @param {Object} messageBody
 * @returns {Promise<Message>}
 */
const createMessage = async (messageBody) => {
  const message = Message.create(messageBody);
  clearKey(Message.collection.collectionName);
  return message;
};

/**
 * Query for messages with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryMessages = async (filter, options) => {
  const messages = await Message.paginate({ ...filter, isDeleted: false }, options);
  return messages;
};

/**
 * find all messages without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getMessages = async (filter, keys, populate = []) => {
  const messages = await Message.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate)
    .cache({ time: config.redis.timeToLive });
  return messages;
};

/**
 * Get messages count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getMessagesCount = async (filter) => {
  return Message.countDocuments(filter);
};

/**
 * Get message by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Message>}
 */
const getMessageById = async (id, populate = []) => {
  return Message.findById(id).populate(populate);
};

/**
 * Get message with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Message>}
 */
const getMessage = async (filter, populate = []) => {
  return Message.findOne(filter).populate(populate);
};

/**
 * Update message by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Message>}
 */
const updateMessage = async (filter, updateBody) => {
  let message = await getMessage(filter);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  message = await Message.updateOne(filter, updateBody);
  clearKey(Message.collection.collectionName);
  return message;
};

/**
 * Update message by id
 * @param {ObjectId} messageId
 * @param {Object} updateBody
 * @returns {Promise<Message>}
 */
const updateMessageById = async (messageId, updateBody) => {
  let message = await getMessageById(messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  message = await Message.findByIdAndUpdate(messageId, updateBody);
  clearKey(Message.collection.collectionName);
  return message;
};

/**
 * Delete message by id
 * @param {ObjectId} messageId
 * @param {Object} deleteBody
 * @returns {Promise<Message>}
 */
const deleteMessageById = async (messageId, deleteBody) => {
  let message = await getMessageById(messageId);
  if (!message) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  message = await Message.findByIdAndUpdate(messageId, { ...deleteBody, isDeleted: true });
  clearKey(Message.collection.collectionName);
  return message;
};

module.exports = {
  createMessage,
  queryMessages,
  getMessageById,
  updateMessage,
  updateMessageById,
  deleteMessageById,
  getMessages,
  getMessagesCount,
};
