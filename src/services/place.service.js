const httpStatus = require('http-status');
const { Place } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

/**
 * Create a place
 * @param {Object} placeBody
 * @returns {Promise<Place>}
 */
const createPlace = async (placeBody) => {
  return Place.create(placeBody);
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
const queryPlaces = async (filter, options) => {
  const places = await Place.paginate({ ...filter, isDeleted: false }, options);
  return places;
};

/**
 * find all places without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getPlaces = async (filter, keys, populate = [], limit = undefined) => {
  const places = await Place.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate)
    .limit(limit);
  // .cache({ time: config.redis.timeToLive });
  return places;
};

/**
 * Get places count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getPlacesCount = async (filter) => {
  return Place.countDocuments(filter);
};

/**
 * Get place by id
 * @param {ObjectId} aggregation
 * @returns {Promise<Place>}
 */
const getAggregatedPlaceById = async (aggregation) => {
  return Place.aggregate(aggregation);
};

/**
 * Get place by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Place>}
 */
const getPlaceById = async (id, select = '', populate = []) => {
  return Place.findById(id).populate(populate).select(select);
};

/**
 * Get place with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Place>}
 */
const getPlace = async (filter, populate = [], select = '') => {
  return Place.findOne(filter).populate(populate).select(select).lean();
};

/**
 * Update place by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Place>}
 */
const updatePlace = async (filter, updateBody) => {
  const place = await getPlace(filter);
  if (!place) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
  }
  return Place.updateOne(filter, updateBody);
};

/**
 * Update place by id
 * @param {ObjectId} placeId
 * @param {Object} updateBody
 * @returns {Promise<Place>}
 */
const updatePlaceById = async (placeId, updateBody) => {
  const place = await getPlaceById(placeId);
  if (!place) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
  }
  await Place.findByIdAndUpdate(placeId, updateBody);
  return place;
};

/**
 * Delete place by id
 * @param {ObjectId} placeId
 * @param {Object} deleteBody
 * @returns {Promise<Place>}
 */
const deletePlaceById = async (placeId, deleteBody) => {
  const place = await getPlaceById(placeId);
  if (!place) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
  }
  await Place.findByIdAndUpdate(placeId, { ...deleteBody, isDeleted: true });
  return place;
};

module.exports = {
  createPlace,
  queryPlaces,
  getPlaceById,
  updatePlace,
  updatePlaceById,
  deletePlaceById,
  getPlaces,
  getPlace,
  getPlacesCount,
  getAggregatedPlaceById,
};
