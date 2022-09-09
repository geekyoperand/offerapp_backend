const httpStatus = require('http-status');
const { Coupon } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a coupon
 * @param {Object} couponBody
 * @returns {Promise<Coupon>}
 */
const createCoupon = async (couponBody) => {
  return Coupon.create(couponBody);
};

/**
 * Query for coupons with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryCoupons = async (filter, options) => {
  const coupons = await Coupon.paginate({ ...filter, isDeleted: false }, options);
  return coupons;
};

/**
 * find all coupons without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getCoupons = async (filter, keys, populate = []) => {
  const coupons = await Coupon.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return coupons;
};

/**
 * Get coupons count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getCouponsCount = async (filter) => {
  return Coupon.countDocuments(filter);
};

/**
 * Get coupon by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Coupon>}
 */
const getCouponById = async (id, populate = []) => {
  return Coupon.findById(id).populate(populate);
};

/**
 * Get coupon with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Coupon>}
 */
const getCoupon = async (filter, populate = []) => {
  return Coupon.findOne(filter).populate(populate);
};

/**
 * Update coupon by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Coupon>}
 */
const updateCoupon = async (filter, updateBody) => {
  const coupon = await getCoupon(filter);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  return Coupon.updateOne(filter, updateBody);
};

/**
 * Update coupon by id
 * @param {ObjectId} couponId
 * @param {Object} updateBody
 * @returns {Promise<Coupon>}
 */
const updateCouponById = async (couponId, updateBody) => {
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  await Coupon.findByIdAndUpdate(couponId, updateBody);
  return coupon;
};

/**
 * Delete coupon by id
 * @param {ObjectId} couponId
 * @param {Object} deleteBody
 * @returns {Promise<Coupon>}
 */
const deleteCouponById = async (couponId, deleteBody) => {
  const coupon = await getCouponById(couponId);
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  await Coupon.findByIdAndUpdate(couponId, { ...deleteBody, isDeleted: true });
  return coupon;
};

module.exports = {
  createCoupon,
  queryCoupons,
  getCouponById,
  updateCoupon,
  updateCouponById,
  deleteCouponById,
  getCoupons,
  getCouponsCount,
  getCoupon,
};
