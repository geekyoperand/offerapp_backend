const httpStatus = require('http-status');
const { RegisterUserTracking } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a registerUserTracking
 * @param {Object} registerUserTrackingBody
 * @returns {Promise<RegisterUserTracking>}
 */
const createRegisterUserTracking = async (registerUserTrackingsBody) => {
  return RegisterUserTracking.create({
    ...registerUserTrackingsBody,
  });
};

/**
 * Query for registerUserTrackings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryRegisterUserTracking = async (filter, options) => {
  const registerUserTrackingss = await RegisterUserTracking.paginate(filter, options);
  return registerUserTrackingss;
};

/**
 * Get registerUserTrackings by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<RegisterUserTracking>}
 */
const getRegisterUserTrackingById = async (id, populate = []) => {
  return RegisterUserTracking.findById(id).populate(populate);
};

/**
 * Get registerUserTrackings count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getRegisterUserTrackingCount = async (filter) => {
  return RegisterUserTracking.countDocuments(filter);
};

/**
 * Get registerUserTrackings with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Place>}
 */
const getRegisterUserTracking = async (filter, populate = []) => {
  return RegisterUserTracking.findOne(filter).populate(populate);
};

/**
 * Get registerUserTrackings by email
 * @param {string} email
 * @returns {Promise<RegisterUserTracking>}
 */
const getRegisterUserTrackingByEmail = async (email) => {
  return RegisterUserTracking.findOne({ email });
};

/**
 * Update registerUserTrackings by id
 * @param {ObjectId} registerUserTrackingsId
 * @param {Object} updateBody
 * @returns {Promise<RegisterUserTracking>}
 */
const updateRegisterUserTrackingById = async (registerUserTrackingsId, updateBody) => {
  const registerUserTrackings = await getRegisterUserTrackingById(registerUserTrackingsId);
  if (!registerUserTrackings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RegisterUserTracking not found');
  }
  if (updateBody.email && (await RegisterUserTracking.isEmailTaken(updateBody.email, registerUserTrackingsId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(registerUserTrackings, updateBody);
  await registerUserTrackings.save();
  return registerUserTrackings;
};

/**
 * Delete registerUserTrackings by id
 * @param {ObjectId} registerUserTrackingsId
 * @param {Object} deleteBody
 * @returns {Promise<RegisterUserTracking>}
 */
const deleteRegisterUserTrackingById = async (registerUserTrackingsId) => {
  const registerUserTrackings = await getRegisterUserTrackingById(registerUserTrackingsId);
  if (!registerUserTrackings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RegisterUserTracking not found');
  }
  await registerUserTrackings.remove();
  return registerUserTrackings;
};

module.exports = {
  createRegisterUserTracking,
  queryRegisterUserTracking,
  getRegisterUserTrackingById,
  getRegisterUserTrackingByEmail,
  updateRegisterUserTrackingById,
  deleteRegisterUserTrackingById,
  getRegisterUserTracking,
  getRegisterUserTrackingCount,
};
