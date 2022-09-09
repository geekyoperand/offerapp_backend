const httpStatus = require('http-status');
const { CouponAppliedHistory } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a couponApplied history
 * @param {Object} couponAppliedHistoryBody
 * @returns {Promise<CouponAppliedHistory>}
 */
const createCouponAppliedHistory = async (couponAppliedHistoryBody) => {
  return CouponAppliedHistory.create(couponAppliedHistoryBody);
};

/**
 * Query for coupon applied histories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryCouponAppliedHistories = async (filter, options) => {
  const couponAppliedHistories = await CouponAppliedHistory.paginate({ ...filter, isDeleted: false }, options);
  return couponAppliedHistories;
};

/**
 * find all coupon applied histories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getCouponAppliedHistories = async (filter, keys, populate = []) => {
  const couponAppliedHistories = await CouponAppliedHistory.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return couponAppliedHistories;
};

/**
 * Get coupon applied histories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getCouponAppliedHistoriesCount = async (filter) => {
  return CouponAppliedHistory.countDocuments(filter);
};

/**
 * Get coupon applied history by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<CouponAppliedHistory>}
 */
const getCouponAppliedHistoryById = async (id, populate = []) => {
  return CouponAppliedHistory.findById(id).populate(populate);
};

/**
 * Get coupon applied history with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<CouponAppliedHistory>}
 */
const getCouponAppliedHistory = async (filter, populate = []) => {
  return CouponAppliedHistory.findOne(filter).populate(populate);
};

/**
 * Update coupon applied history by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<CouponAppliedHistory>}
 */
const updateCouponAppliedHistory = async (filter, updateBody) => {
  const couponAppliedHistory = await getCouponAppliedHistory(filter);
  if (!couponAppliedHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CouponAppliedHistory not found');
  }
  return CouponAppliedHistory.updateOne(filter, updateBody);
};

/**
 * Update coupon applied history by id
 * @param {ObjectId} couponAppliedHistoryId
 * @param {Object} updateBody
 * @returns {Promise<CouponAppliedHistory>}
 */
const updateCouponAppliedHistoryById = async (couponAppliedHistoryId, updateBody) => {
  const couponAppliedHistory = await getCouponAppliedHistoryById(couponAppliedHistoryId);
  if (!couponAppliedHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CouponAppliedHistory not found');
  }
  await CouponAppliedHistory.findByIdAndUpdate(couponAppliedHistoryId, updateBody);
  return couponAppliedHistory;
};

/**
 * Delete coupon applied history by id
 * @param {ObjectId} couponAppliedHistoryId
 * @param {Object} deleteBody
 * @returns {Promise<CouponAppliedHistory>}
 */
const deleteCouponAppliedHistoryById = async (couponAppliedHistoryId, deleteBody) => {
  const couponAppliedHistory = await getCouponAppliedHistoryById(couponAppliedHistoryId);
  if (!couponAppliedHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CouponAppliedHistory not found');
  }
  await CouponAppliedHistory.findByIdAndUpdate(couponAppliedHistoryId, { ...deleteBody, isDeleted: true });
  return couponAppliedHistory;
};

module.exports = {
  createCouponAppliedHistory,
  queryCouponAppliedHistories,
  getCouponAppliedHistoryById,
  updateCouponAppliedHistory,
  updateCouponAppliedHistoryById,
  deleteCouponAppliedHistoryById,
  getCouponAppliedHistories,
  getCouponAppliedHistoriesCount,
  getCouponAppliedHistory,
};
