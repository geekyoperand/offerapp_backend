const httpStatus = require('http-status');
const { Device } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a device
 * @param {Object} deviceBody
 * @returns {Promise<Device>}
 */
const createDevice = async (deviceBody) => {
  return Device.create(deviceBody);
};

/**
 * Query for devices with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryDevices = async (filter, options) => {
  const devices = await Device.paginate({ ...filter, isDeleted: false }, options);
  return devices;
};

/**
 * find all devices without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getDevices = async (filter, keys, populate = []) => {
  const devices = await Device.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return devices;
};

/**
 * Get devices count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getDevicesCount = async (filter) => {
  return Device.countDocuments(filter);
};

/**
 * Get device by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Device>}
 */
const getDeviceById = async (id, populate = []) => {
  return Device.findById(id).populate(populate);
};

/**
 * Get device with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Device>}
 */
const getDevice = async (filter, populate = []) => {
  return Device.findOne(filter).populate(populate);
};

/**
 * Update device by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @param {Object} options
 * @returns {Promise<Device>}
 */
const updateDevice = async (filter, updateBody, options = {}) => {
  // const device = await getDevice(filter);
  // if (!device) {
  //   throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  // }
  return Device.updateOne(filter, updateBody, options);
};

/**
 * Update devices by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Device>}
 */
const updateDevices = async (filter, updateBody) => {
  return Device.updateMany(filter, updateBody);
};

/**
 * Update device by id
 * @param {ObjectId} deviceId
 * @param {Object} updateBody
 * @returns {Promise<Device>}
 */
const updateDeviceById = async (deviceId, updateBody) => {
  const device = await getDeviceById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }
  await Device.findByIdAndUpdate(deviceId, updateBody);
  return device;
};

/**
 * Delete device by id
 * @param {ObjectId} deviceId
 * @param {Object} deleteBody
 * @returns {Promise<Device>}
 */
const deleteDeviceById = async (deviceId, deleteBody) => {
  const device = await getDeviceById(deviceId);
  if (!device) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }
  await Device.findByIdAndUpdate(deviceId, { ...deleteBody, isDeleted: true });
  return device;
};

module.exports = {
  createDevice,
  queryDevices,
  getDeviceById,
  updateDevice,
  updateDeviceById,
  deleteDeviceById,
  getDevices,
  getDevicesCount,
  updateDevices,
};
