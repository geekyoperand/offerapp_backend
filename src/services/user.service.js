const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create({ ...userBody, referCode: await User.generateReferralCode() });
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * find all view histories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const findUsers = async (filter, keys, populate = []) => {
  const users = await User.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @param {String} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<User>}
 */
const getUserById = async (id, keys, populate = []) => {
  return User.findById(id).select(keys).populate(populate);
};

/**
 * Get users count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getUsersCount = async (filter) => {
  return User.countDocuments(filter);
};

/**
 * Get user with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Place>}
 */
const getUser = async (filter, keys, populate = []) => {
  return User.findOne(filter).populate(populate).select(keys);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @param {String} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email, keys, populate = []) => {
  return User.findOne({ email }).select(keys).populate(populate);
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await User.findByIdAndUpdate(userId, updateBody);
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @param {Object} deleteBody
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getUser,
  getUsersCount,
  findUsers,
};
