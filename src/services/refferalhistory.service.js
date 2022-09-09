const httpStatus = require('http-status');
const { RefferalHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a refferal history
 * @param {Object} refferalHistoryBody
 * @returns {Promise<RefferalHistory>}
 */
const createRefferalHistory = async (refferalHistoryBody) => {
  return RefferalHistory.create(refferalHistoryBody);
};

/**
 * Query for refferal histories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryRefferalHistories = async (filter, options) => {
  const refferalHistories = await RefferalHistory.paginate({ ...filter, isDeleted: false }, options);
  return refferalHistories;
};

/**
 * find all refferal histories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getRefferalHistories = async (filter, keys, populate = []) => {
  const refferalHistories = await RefferalHistory.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return refferalHistories;
};

/**
 * Get refferal histories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getRefferalHistoriesCount = async (filter) => {
  return RefferalHistory.countDocuments(filter);
};

/**
 * Get refferal history by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<RefferalHistory>}
 */
const getRefferalHistoryById = async (id, populate = []) => {
  return RefferalHistory.findById(id).populate(populate);
};

/**
 * Get refferal history with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<RefferalHistory>}
 */
const getRefferalHistory = async (filter, populate = []) => {
  return RefferalHistory.findOne(filter).populate(populate);
};

/**
 * Update refferalH history by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<RefferalHistory>}
 */
const updateRefferalHistory = async (filter, updateBody) => {
  const refferalHistory = await getRefferalHistory(filter);
  if (!refferalHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RefferalHistory not found');
  }
  return RefferalHistory.updateOne(filter, updateBody);
};

/**
 * Update refferal history by id
 * @param {ObjectId} refferalHistoryId
 * @param {Object} updateBody
 * @returns {Promise<RefferalHistory>}
 */
const updateRefferalHistoryById = async (refferalHistoryId, updateBody) => {
  const refferalHistory = await getRefferalHistoryById(refferalHistoryId);
  if (!refferalHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RefferalHistory not found');
  }
  await RefferalHistory.findByIdAndUpdate(refferalHistoryId, updateBody);
  return refferalHistory;
};

/**
 * Delete refferal history by id
 * @param {ObjectId} refferalHistoryId
 * @param {Object} deleteBody
 * @returns {Promise<RefferalHistory>}
 */
const deleteRefferalHistoryById = async (refferalHistoryId, deleteBody) => {
  const refferalHistory = await getRefferalHistoryById(refferalHistoryId);
  if (!refferalHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RefferalHistory not found');
  }
  await RefferalHistory.findByIdAndUpdate(refferalHistoryId, { ...deleteBody, isDeleted: true });
  return refferalHistory;
};

module.exports = {
  createRefferalHistory,
  queryRefferalHistories,
  getRefferalHistoryById,
  updateRefferalHistory,
  updateRefferalHistoryById,
  deleteRefferalHistoryById,
  getRefferalHistories,
  getRefferalHistoriesCount,
};
