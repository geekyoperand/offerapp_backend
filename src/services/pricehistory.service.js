const httpStatus = require('http-status');
const { PriceHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a price history
 * @param {Object} priceHistoryBody
 * @returns {Promise<PriceHistory>}
 */
const createPriceHistory = async (priceHistoryBody) => {
  return PriceHistory.create(priceHistoryBody);
};

/**
 * Query for price histories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryPriceHistories = async (filter, options) => {
  const priceHistories = await PriceHistory.paginate({ ...filter, isDeleted: false }, options);
  return priceHistories;
};

/**
 * find all price histories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getPriceHistories = async (filter, keys, populate = []) => {
  const priceHistories = await PriceHistory.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return priceHistories;
};

/**
 * Get price histories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getPriceHistoriesCount = async (filter) => {
  return PriceHistory.countDocuments(filter);
};

/**
 * Get price history by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<PriceHistory>}
 */
const getPriceHistoryById = async (id, populate = []) => {
  return PriceHistory.findById(id).populate(populate);
};

/**
 * Get price history with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<PriceHistory>}
 */
const getPriceHistory = async (filter, populate = []) => {
  return PriceHistory.findOne(filter).populate(populate);
};

/**
 * Update priceH history by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<PriceHistory>}
 */
const updatePriceHistory = async (filter, updateBody) => {
  const priceHistory = await getPriceHistory(filter);
  if (!priceHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PriceHistory not found');
  }
  return PriceHistory.updateOne(filter, updateBody);
};

/**
 * Update price history by id
 * @param {ObjectId} priceHistoryId
 * @param {Object} updateBody
 * @returns {Promise<PriceHistory>}
 */
const updatePriceHistoryById = async (priceHistoryId, updateBody) => {
  const priceHistory = await getPriceHistoryById(priceHistoryId);
  if (!priceHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PriceHistory not found');
  }
  await PriceHistory.findByIdAndUpdate(priceHistoryId, updateBody);
  return priceHistory;
};

/**
 * Delete price history by id
 * @param {ObjectId} priceHistoryId
 * @param {Object} deleteBody
 * @returns {Promise<PriceHistory>}
 */
const deletePriceHistoryById = async (priceHistoryId, deleteBody) => {
  const priceHistory = await getPriceHistoryById(priceHistoryId);
  if (!priceHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'PriceHistory not found');
  }
  await PriceHistory.findByIdAndUpdate(priceHistoryId, { ...deleteBody, isDeleted: true });
  return priceHistory;
};

module.exports = {
  createPriceHistory,
  queryPriceHistories,
  getPriceHistoryById,
  updatePriceHistory,
  updatePriceHistoryById,
  deletePriceHistoryById,
  getPriceHistories,
  getPriceHistoriesCount,
};
