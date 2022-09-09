const httpStatus = require('http-status');
const { PointHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a point history
 * @param {Object} pointHistoryBody
 * @returns {Promise<PointHistory>}
 */
const createPointHistory = async (pointHistoryBody) => {
  return PointHistory.create(pointHistoryBody);
};

/**
 * Create bulk point history
 * @param {Array<Object>} pointHistoryBodies
 * @returns {Promise<PointHistory>}
 */
const createPointHistories = async (pointHistoryBodies) => {
  return PointHistory.insertMany(pointHistoryBodies);
};

/**
 * Query for point histories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryPointHistories = async (filter, options) => {
  const pointHistories = await PointHistory.paginate({ ...filter, isDeleted: false }, options);
  return pointHistories;
};

/**
 * find all point histories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getPointHistories = async (filter, keys, populate = []) => {
  const pointHistories = await PointHistory.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return pointHistories;
};

/**
 * Get point histories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getPointHistoriesCount = async (filter) => {
  return PointHistory.countDocuments(filter);
};

/**
 * Get point history by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<PointHistory>}
 */
const getPointHistoryById = async (id, populate = []) => {
  return PointHistory.findById(id).populate(populate);
};

/**
 * Get point history with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<PointHistory>}
 */
const getPointHistory = async (filter, populate = []) => {
  return PointHistory.findOne(filter).populate(populate);
};

/**
 * Update pointH history by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<PointHistory>}
 */
const updatePointHistory = async (filter, updateBody) => {
  const pointHistory = await getPointHistory(filter);
  if (!pointHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PointHistory not found');
  }
  return PointHistory.updateOne(filter, updateBody);
};

/**
 * Update point history by id
 * @param {ObjectId} pointHistoryId
 * @param {Object} updateBody
 * @returns {Promise<PointHistory>}
 */
const updatePointHistoryById = async (pointHistoryId, updateBody) => {
  const pointHistory = await getPointHistoryById(pointHistoryId);
  if (!pointHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PointHistory not found');
  }
  await PointHistory.findByIdAndUpdate(pointHistoryId, updateBody);
  return pointHistory;
};

/**
 * Delete point history by id
 * @param {ObjectId} pointHistoryId
 * @param {Object} deleteBody
 * @returns {Promise<PointHistory>}
 */
const deletePointHistoryById = async (pointHistoryId, deleteBody) => {
  const pointHistory = await getPointHistoryById(pointHistoryId);
  if (!pointHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PointHistory not found');
  }
  await PointHistory.findByIdAndUpdate(pointHistoryId, { ...deleteBody, isDeleted: true });
  return pointHistory;
};

module.exports = {
  createPointHistory,
  queryPointHistories,
  getPointHistoryById,
  updatePointHistory,
  updatePointHistoryById,
  deletePointHistoryById,
  getPointHistories,
  getPointHistoriesCount,
  createPointHistories,
};
