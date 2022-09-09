const httpStatus = require('http-status');
const { Banner } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');
/**
 * Create a banner
 * @param {Object} bannerBody
 * @returns {Promise<Banner>}
 */
const createBanner = async (bannerBody) => {
  const banner = await Banner.create(bannerBody);
  clearKey(Banner.collection.collectionName);
  return banner;
};

/**
 * Query for banners with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryBanners = async (filter, options) => {
  const banners = await Banner.paginate({ ...filter, isDeleted: false }, options);
  return banners;
};

/**
 * find all banners without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getBanners = async (filter, keys, populate = []) => {
  const banners = await Banner.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  // .cache({ time: config.redis.timeToLive });
  return banners;
};

/**
 * Get banners count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getBannersCount = async (filter) => {
  return Banner.countDocuments(filter);
};

/**
 * Get banner by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Banner>}
 */
const getBannerById = async (id, populate = []) => {
  return Banner.findById(id).populate(populate);
};

/**
 * Get banner with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Banner>}
 */
const getBanner = async (filter, populate = []) => {
  return Banner.findOne(filter).populate(populate);
};

/**
 * Update banner by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Banner>}
 */
const updateBanner = async (filter, updateBody) => {
  let banner = await getBanner(filter);
  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }
  banner = await Banner.updateOne(filter, updateBody);
  clearKey(Banner.collection.collectionName);
  return banner;
};

/**
 * Update banner by id
 * @param {ObjectId} bannerId
 * @param {Object} updateBody
 * @returns {Promise<Banner>}
 */
const updateBannerById = async (bannerId, updateBody) => {
  let banner = await getBannerById(bannerId);
  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }
  banner = await Banner.findByIdAndUpdate(bannerId, updateBody);
  clearKey(Banner.collection.collectionName);
  return banner;
};

/**
 * Delete banner by id
 * @param {ObjectId} bannerId
 * @param {Object} deleteBody
 * @returns {Promise<Banner>}
 */
const deleteBannerById = async (bannerId, deleteBody) => {
  let banner = await getBannerById(bannerId);
  if (!banner) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  }
  banner = await Banner.findByIdAndUpdate(bannerId, { ...deleteBody, isDeleted: true });
  clearKey(Banner.collection.collectionName);
  return banner;
};

module.exports = {
  createBanner,
  queryBanners,
  getBannerById,
  updateBanner,
  updateBannerById,
  deleteBannerById,
  getBanners,
  getBannersCount,
};
