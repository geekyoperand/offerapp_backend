const httpStatus = require('http-status');
const { Search } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');
/**
 * Create a search
 * @param {Object} searchBody
 * @returns {Promise<Search>}
 */
const createSearch = async (searchBody) => {
  const search = await Search.findOneAndUpdate(
    { ...searchBody, isDeleted: false },
    { $inc: { searchCount: 1 } },
    { upsert: true }
  );
  clearKey(Search.collection.collectionName);
  return search;
};

/**
 * Query for searches with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const querySearches = async (filter, options) => {
  const searches = await Search.paginate({ ...filter, isDeleted: false }, options);
  return searches;
};

/**
 * find all searches without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getSearches = async (filter, keys, populate = []) => {
  const searches = await Search.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  // .cache({ time: config.redis.timeToLive });
  return searches;
};

/**
 * Get searches count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getSearchesCount = async (filter) => {
  return Search.countDocuments(filter);
};

/**
 * Get search by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Search>}
 */
const getSearchById = async (id, populate = []) => {
  return Search.findById(id).populate(populate);
};

/**
 * Get search with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Search>}
 */
const getSearch = async (filter, populate = []) => {
  return Search.findOne(filter).populate(populate);
};

/**
 * Update search by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Search>}
 */
const updateSearch = async (filter, updateBody) => {
  let search = await getSearch(filter);
  if (!search) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Search not found');
  }
  search = await Search.updateOne(filter, updateBody);
  clearKey(Search.collection.collectionName);
  return search;
};

/**
 * Update search by id
 * @param {ObjectId} searchId
 * @param {Object} updateBody
 * @returns {Promise<Search>}
 */
const updateSearchById = async (searchId, updateBody) => {
  let search = await getSearchById(searchId);
  if (!search) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Search not found');
  }
  search = await Search.findByIdAndUpdate(searchId, updateBody);
  clearKey(Search.collection.collectionName);
  return search;
};

/**
 * Delete search by id
 * @param {ObjectId} searchId
 * @param {Object} deleteBody
 * @returns {Promise<Search>}
 */
const deleteSearchById = async (searchId, deleteBody) => {
  let search = await getSearchById(searchId);
  if (!search) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Search not found');
  }
  search = await Search.findByIdAndUpdate(searchId, { ...deleteBody, isDeleted: true });
  clearKey(Search.collection.collectionName);
  return search;
};

module.exports = {
  createSearch,
  querySearches,
  getSearchById,
  updateSearch,
  updateSearchById,
  deleteSearchById,
  getSearches,
  getSearchesCount,
};
