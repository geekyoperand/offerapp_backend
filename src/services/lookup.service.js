const httpStatus = require('http-status');
const { Lookup } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');
/**
 * Create a lookup
 * @param {Object} lookupBody
 * @returns {Promise<Lookup>}
 */
const createLookup = async (lookupBody) => {
  const lookup = await Lookup.create(lookupBody);
  clearKey(Lookup.collection.collectionName);
  return lookup;
};

/**
 * Query for lookups with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryLookups = async (filter, options) => {
  const lookups = await Lookup.paginate({ ...filter, isDeleted: false }, options);
  return lookups;
};

/**
 * find all lookups without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getLookups = async (filter, keys, populate = []) => {
  const lookups = await Lookup.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate)
    .cache({ time: config.redis.timeToLive });
  return lookups;
};

/**
 * Get lookups count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getLookupsCount = async (filter) => {
  return Lookup.countDocuments(filter);
};

/**
 * Get lookup by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Lookup>}
 */
const getLookupById = async (id, populate = []) => {
  return Lookup.findById(id).populate(populate);
};

/**
 * Get lookup with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Lookup>}
 */
const getLookup = async (filter, populate = []) => {
  return Lookup.findOne(filter).populate(populate);
};

/**
 * Update lookup by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Lookup>}
 */
const updateLookup = async (filter, updateBody) => {
  let lookup = await getLookup(filter);
  if (!lookup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lookup not found');
  }
  lookup = Lookup.updateOne(filter, updateBody);
  clearKey(Lookup.collection.collectionName);
  return lookup;
};

/**
 * Update lookup by id
 * @param {ObjectId} lookupId
 * @param {Object} updateBody
 * @returns {Promise<Lookup>}
 */
const updateLookupById = async (lookupId, updateBody) => {
  let lookup = await getLookupById(lookupId);
  if (!lookup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lookup not found');
  }
  lookup = await Lookup.findByIdAndUpdate(lookupId, updateBody);
  clearKey(Lookup.collection.collectionName);
  return lookup;
};

/**
 * Delete lookup by id
 * @param {ObjectId} lookupId
 * @param {Object} deleteBody
 * @returns {Promise<Lookup>}
 */
const deleteLookupById = async (lookupId, deleteBody) => {
  let lookup = await getLookupById(lookupId);
  if (!lookup) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Lookup not found');
  }
  lookup = await Lookup.findByIdAndUpdate(lookupId, { ...deleteBody, isDeleted: true });
  clearKey(Lookup.collection.collectionName);
  return lookup;
};

module.exports = {
  createLookup,
  queryLookups,
  getLookupById,
  updateLookup,
  updateLookupById,
  deleteLookupById,
  getLookups,
  getLookupsCount,
};
