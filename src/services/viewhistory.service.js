const httpStatus = require('http-status');
const { ViewHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a view history
 * @param {Object} viewHistoryBody
 * @returns {Promise<ViewHistory>}
 */
const createViewHistory = async (viewHistoryBody) => {
  return ViewHistory.create(viewHistoryBody);
};

/**
 * Query for view histories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
// const queryViewHistories = async (aggregation, options) => {
//   const viewHistoryQueryAggregation = ViewHistory.aggregate(aggregation);
//   const viewHistories = await ViewHistory.aggregatePaginate(viewHistoryQueryAggregation, options);
//   return viewHistories;
// };

const queryViewHistories = async (filter, options) => {
  const viewHistories = await ViewHistory.aggregatePaginate(
    ViewHistory.aggregate(filter),
    options
  );
  return viewHistories;
};

/**
 * find all view histories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getViewHistories = async (filter, keys, populate = []) => {
  const viewHistories = await ViewHistory.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return viewHistories;
};

/**
 * Get view histories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getViewHistoriesCount = async (filter) => {
  return ViewHistory.countDocuments(filter);
};

/**
 * Get view history by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<ViewHistory>}
 */
const getViewHistoryById = async (id, populate = []) => {
  return ViewHistory.findById(id).populate(populate);
};

/**
 * Get view history with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<ViewHistory>}
 */
const getViewHistory = async (filter, populate = []) => {
  return ViewHistory.findOne(filter).populate(populate);
};

/**
 * Update viewH history by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<ViewHistory>}
 */
const updateViewHistory = async (filter, updateBody) => {
  const viewHistory = await getViewHistory(filter);
  if (!viewHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ViewHistory not found');
  }
  return ViewHistory.updateOne(filter, updateBody);
};

/**
 * Update view history by id
 * @param {ObjectId} viewHistoryId
 * @param {Object} updateBody
 * @returns {Promise<ViewHistory>}
 */
const updateViewHistoryById = async (viewHistoryId, updateBody) => {
  const viewHistory = await getViewHistoryById(viewHistoryId);
  if (!viewHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ViewHistory not found');
  }
  await ViewHistory.findByIdAndUpdate(viewHistoryId, updateBody);
  return viewHistory;
};

/**
 * Delete view history by id
 * @param {ObjectId} viewHistoryId
 * @param {Object} deleteBody
 * @returns {Promise<ViewHistory>}
 */
const deleteViewHistoryById = async (viewHistoryId, deleteBody) => {
  const viewHistory = await getViewHistoryById(viewHistoryId);
  if (!viewHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'ViewHistory not found');
  }
  await ViewHistory.findByIdAndUpdate(viewHistoryId, { ...deleteBody, isDeleted: true });
  return viewHistory;
};

module.exports = {
  createViewHistory,
  queryViewHistories,
  getViewHistoryById,
  updateViewHistory,
  updateViewHistoryById,
  deleteViewHistoryById,
  getViewHistories,
  getViewHistoriesCount,
};
