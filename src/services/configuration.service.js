const httpStatus = require('http-status');
const { Configuration } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');

/**
 * Create a configuration
 * @param {Object} configurationBody
 * @returns {Promise<Configuration>}
 */
const createConfiguration = async (configurationBody) => {
  const configuration = await Configuration.create(configurationBody);
  clearKey(Configuration.collection.collectionName);
  return configuration;
};

/**
 * Query for configurations with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryConfigurations = async (filter, options) => {
  const configurations = await Configuration.paginate({ ...filter, isDeleted: false }, options);
  return configurations;
};

/**
 * find all configurations without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getConfigurations = async (filter, keys, populate = []) => {
  const configurations = await Configuration.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate)
    .cache({ time: config.redis.timeToLive });

  return configurations;
};

/**
 * Get configurations count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getConfigurationsCount = async (filter) => {
  return Configuration.countDocuments(filter);
};

/**
 * Get configuration by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Configuration>}
 */
const getConfigurationById = async (id, populate = []) => {
  return Configuration.findById(id).populate(populate);
};

/**
 * Get configuration with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Configuration>}
 */
const getConfiguration = async (filter, populate = []) => {
  return Configuration.findOne(filter).populate(populate);
};

/**
 * Update configuration by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Configuration>}
 */
const updateConfiguration = async (filter, updateBody) => {
  let configuration = await getConfiguration(filter);
  if (!configuration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Configuration not found');
  }
  configuration = Configuration.updateOne(filter, updateBody);
  clearKey(Configuration.collection.collectionName);
  return configuration;
};

/**
 * Update configuration by id
 * @param {ObjectId} configurationId
 * @param {Object} updateBody
 * @returns {Promise<Configuration>}
 */
const updateConfigurationById = async (configurationId, updateBody) => {
  let configuration = await getConfigurationById(configurationId);
  if (!configuration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Configuration not found');
  }
  configuration = await Configuration.findByIdAndUpdate(configurationId, updateBody);
  clearKey(Configuration.collection.collectionName);
  return configuration;
};

/**
 * Delete configuration by id
 * @param {ObjectId} configurationId
 * @param {Object} deleteBody
 * @returns {Promise<Configuration>}
 */
const deleteConfigurationById = async (configurationId, deleteBody) => {
  let configuration = await getConfigurationById(configurationId);
  if (!configuration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Configuration not found');
  }
  configuration = await Configuration.findByIdAndUpdate(configurationId, { ...deleteBody, isDeleted: true });
  clearKey(Configuration.collection.collectionName);
  return configuration;
};

module.exports = {
  createConfiguration,
  queryConfigurations,
  getConfigurationById,
  updateConfiguration,
  updateConfigurationById,
  deleteConfigurationById,
  getConfigurations,
  getConfiguration,
  getConfigurationsCount,
};
