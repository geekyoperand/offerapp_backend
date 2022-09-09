const httpStatus = require('http-status');
const { Favorite } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a favorite
 * @param {Object} favoriteBody
 * @returns {Promise<Favorite>}
 */
const createFavorite = async (favoriteBody) => {
  return Favorite.create(favoriteBody);
};

/**
 * Query for favorites with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryFavorites = async (filter, options) => {
  const favorites = await Favorite.paginate({ ...filter, isDeleted: false }, options);
  return favorites;
};

/**
 * find all favorites without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getFavorites = async (filter, keys, populate = []) => {
  const favorites = await Favorite.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return favorites;
};

/**
 * Get favorites count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getFavoritesCount = async (filter) => {
  return Favorite.countDocuments(filter);
};

/**
 * Get favorite by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Favorite>}
 */
const getFavoriteById = async (id, populate = []) => {
  return Favorite.findById(id).populate(populate);
};

/**
 * Get favorite with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Favorite>}
 */
const getFavorite = async (filter, keys, populate = []) => {
  return Favorite.findOne(filter).select(keys).populate(populate);
};

/**
 * Update favorite by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Favorite>}
 */
const updateFavorite = async (filter, updateBody) => {
  const favorite = await getFavorite(filter);
  if (!favorite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Favorite not found');
  }
  return Favorite.updateOne(filter, updateBody);
};

/**
 * Update favorite by id
 * @param {ObjectId} favoriteId
 * @param {Object} updateBody
 * @returns {Promise<Favorite>}
 */
const updateFavoriteById = async (favoriteId, updateBody) => {
  const favorite = await getFavoriteById(favoriteId);
  if (!favorite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Favorite not found');
  }
  await Favorite.findByIdAndUpdate(favoriteId, updateBody);
  return favorite;
};

/**
 * Delete favorite by id
 * @param {ObjectId} favoriteId
 * @param {Object} deleteBody
 * @returns {Promise<Favorite>}
 */
const deleteFavoriteById = async (favoriteId, deleteBody) => {
  const favorite = await getFavoriteById(favoriteId);
  if (!favorite) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Favorite not found');
  }
  await Favorite.findByIdAndUpdate(favoriteId, { ...deleteBody, isDeleted: true });
  return favorite;
};

module.exports = {
  createFavorite,
  queryFavorites,
  getFavoriteById,
  updateFavorite,
  updateFavoriteById,
  deleteFavoriteById,
  getFavorites,
  getFavoritesCount,
  getFavorite,
};
