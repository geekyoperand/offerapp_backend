const httpStatus = require('http-status');
const { OTP, Place } = require('../models');
const ApiError = require('../utils/ApiError');
// TODO - Recheck if we need this
// const config = require('../config/config');

/**
 * Create a place
 * @param {Object} placeBody
 * @returns {Promise<OTP>}
 */
const createOTP = async (placeBody) => {
  return OTP.create(placeBody);
};

/**
 * Query for places with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryOTPs = async (filter, options) => {
  const places = await OTP.paginate({ ...filter, isDeleted: false }, options);
  return places;
};

/**
 * find all places without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getOTPs = async (filter, keys, populate = []) => {
  const otps = await OTP.find({ ...filter, isDeleted: false }, keys).populate(populate);
  // TODO - Recheck if we need this
  // .cache({ time: config.redis.timeToLive });
  return otps;
};

/**
 * Get places count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getOTPsCount = async (filter) => {
  return OTP.countDocuments(filter);
};

/**
 * Get place by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<OTP>}
 */
const getOTPById = async (id, populate = []) => {
  return OTP.findById(id).populate(populate);
};

/**
 * Get place with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<OTP>}
 */
const getOTP = async (filter, populate = []) => {
  return OTP.findOne(filter).populate(populate);
};

/**
 * Update place by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<OTP>}
 */
const updateOTP = async (filter, updateBody, options = {}) => {
  return OTP.updateOne(filter, updateBody, options);
};

/**
 * Update place by id
 * @param {ObjectId} placeId
 * @param {Object} updateBody
 * @returns {Promise<OTP>}
 */
const updateOTPById = async (placeId, updateBody) => {
  const place = await getOTPById(placeId);
  if (!place) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP not found');
  }
  await Place.findByIdAndUpdate(placeId, updateBody);
  return place;
};

/**
 * Delete place by id
 * @param {ObjectId} placeId
 * @param {Object} deleteBody
 * @returns {Promise<OTP>}
 */
const deleteOTPById = async (placeId, deleteBody) => {
  const place = await getOTPById(placeId);
  if (!place) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OTP not found');
  }
  await Place.findByIdAndUpdate(placeId, { ...deleteBody, isDeleted: true });
  return place;
};

module.exports = {
  createOTP,
  queryOTPs,
  getOTPById,
  updateOTP,
  updateOTPById,
  deleteOTPById,
  getOTPs,
  getOTP,
  getOTPsCount,
};
