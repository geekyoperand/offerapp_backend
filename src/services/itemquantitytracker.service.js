const httpStatus = require('http-status');
const { ItemQuantityTracker } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a itemQuantityTracker
 * @param {Object} itemQuantityTrackerBody
 * @returns {Promise<ItemQuantityTracker>}
 */
const createItemQuantityTracker = async (itemQuantityTrackerBody) => {
  return ItemQuantityTracker.create(itemQuantityTrackerBody);
};

/**
 * Query for itemQuantityTrackers with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryItemQuantityTrackers = async (filter, options) => {
  const itemQuantityTrackers = await ItemQuantityTracker.paginate({ ...filter, isDeleted: false }, options);
  return itemQuantityTrackers;
};

/**
 * find all itemQuantityTrackers without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getItemQuantityTrackers = async (filter, keys, populate = []) => {
  const itemQuantityTrackers = await ItemQuantityTracker.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return itemQuantityTrackers;
};

/**
 * Get itemQuantityTrackers count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getItemQuantityTrackersCount = async (filter) => {
  return ItemQuantityTracker.countDocuments(filter);
};

/**
 * Get itemQuantityTracker by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<ItemQuantityTracker>}
 */
const getItemQuantityTrackerById = async (id, populate = []) => {
  return ItemQuantityTracker.findById(id).populate(populate);
};

/**
 * Get itemQuantityTracker with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<ItemQuantityTracker>}
 */
const getItemQuantityTracker = async (filter, populate = []) => {
  return ItemQuantityTracker.findOne(filter).populate(populate);
};

/**
 * Update itemQuantityTracker by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<ItemQuantityTracker>}
 */
const updateItemQuantityTracker = async (filter, updateBody) => {
  const itemQuantityTracker = await getItemQuantityTracker(filter);
  if (!itemQuantityTracker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ItemQuantityTracker not found');
  }
  return ItemQuantityTracker.updateOne(filter, updateBody);
};

/**
 * Update itemQuantityTracker by id
 * @param {ObjectId} itemQuantityTrackerId
 * @param {Object} updateBody
 * @returns {Promise<ItemQuantityTracker>}
 */
const updateItemQuantityTrackerById = async (itemQuantityTrackerId, updateBody) => {
  const itemQuantityTracker = await getItemQuantityTrackerById(itemQuantityTrackerId);
  if (!itemQuantityTracker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ItemQuantityTracker not found');
  }
  await ItemQuantityTracker.findByIdAndUpdate(itemQuantityTrackerId, updateBody);
  return itemQuantityTracker;
};


/**
 * Update item quantities by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<ItemQuantity>}
 */
const updateItemQuanitites = async (filter, updateBody) => {
  return ItemQuantityTracker.updateMany(filter, updateBody);
};

/**
 * Delete itemQuantityTracker by id
 * @param {ObjectId} itemQuantityTrackerId
 * @param {Object} deleteBody
 * @returns {Promise<ItemQuantityTracker>}
 */
const deleteItemQuantityTrackerById = async (itemQuantityTrackerId, deleteBody) => {
  const itemQuantityTracker = await getItemQuantityTrackerById(itemQuantityTrackerId);
  if (!itemQuantityTracker) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ItemQuantityTracker not found');
  }
  await ItemQuantityTracker.findByIdAndUpdate(itemQuantityTrackerId, { ...deleteBody, isDeleted: true });
  return itemQuantityTracker;
};

module.exports = {
  createItemQuantityTracker,
  queryItemQuantityTrackers,
  getItemQuantityTrackerById,
  updateItemQuantityTracker,
  updateItemQuantityTrackerById,
  deleteItemQuantityTrackerById,
  getItemQuantityTrackers,
  getItemQuantityTrackersCount,
  getItemQuantityTracker,
};
