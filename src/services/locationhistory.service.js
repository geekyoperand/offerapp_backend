const httpStatus = require('http-status');
const { LocationHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a locationHistory
 * @param {Object} locationHistoryBody
 * @returns {Promise<LocationHistory>}
 */
const createLocationHistory = async (locationHistoryBody) => {
  return LocationHistory.create(locationHistoryBody);
};

/**
 * Query for locationHistories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryLocationHistories = async (filter, options) => {
  const locationHistories = await LocationHistory.paginate({ ...filter, isDeleted: false }, options);
  return locationHistories;
};

/**
 * find all locationHistories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getLocationHistories = async (filter, keys, populate = []) => {
  const locationHistories = await LocationHistory.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return locationHistories;
};

/**
 * Get locationHistories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getLocationHistoriesCount = async (filter) => {
  return LocationHistory.countDocuments(filter);
};

/**
 * Get locationHistory by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<LocationHistory>}
 */
const getLocationHistoryById = async (id, populate = []) => {
  return LocationHistory.findById(id).populate(populate);
};

/**
 * Get locationHistory with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<LocationHistory>}
 */
const getLocationHistory = async (filter, populate = []) => {
  return LocationHistory.findOne(filter).populate(populate);
};

/**
 * Update locationHistory by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<LocationHistory>}
 */
const updateLocationHistory = async (filter, updateBody) => {
  const locationHistory = await getLocationHistory(filter);
  if (!locationHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LocationHistory not found');
  }
  return LocationHistory.updateOne(filter, updateBody);
};

/**
 * Update locationHistory by id
 * @param {ObjectId} locationHistoryId
 * @param {Object} updateBody
 * @returns {Promise<LocationHistory>}
 */
const updateLocationHistoryById = async (locationHistoryId, updateBody) => {
  const locationHistory = await getLocationHistoryById(locationHistoryId);
  if (!locationHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LocationHistory not found');
  }
  await LocationHistory.findByIdAndUpdate(locationHistoryId, updateBody);
  return locationHistory;
};

/**
 * Delete locationHistory by id
 * @param {ObjectId} locationHistoryId
 * @param {Object} deleteBody
 * @returns {Promise<LocationHistory>}
 */
const deleteLocationHistoryById = async (locationHistoryId, deleteBody) => {
  const locationHistory = await getLocationHistoryById(locationHistoryId);
  if (!locationHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'LocationHistory not found');
  }
  await LocationHistory.findByIdAndUpdate(locationHistoryId, { ...deleteBody, isDeleted: true });
  return locationHistory;
};

module.exports = {
  createLocationHistory,
  queryLocationHistories,
  getLocationHistoryById,
  updateLocationHistory,
  updateLocationHistoryById,
  deleteLocationHistoryById,
  getLocationHistories,
  getLocationHistoriesCount,
};
