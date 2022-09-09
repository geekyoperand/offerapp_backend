const httpStatus = require('http-status');
const { Item } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a item
 * @param {Object} itemBody
 * @returns {Promise<Item>}
 */
const createItem = async (itemBody) => {
  return Item.create(itemBody);
};

/**
 * Query for items with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryItems = async (filter, options) => {
  const items = await Item.paginate({ ...filter, isDeleted: false }, options);
  return items;
};

/**
 * find all items without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getItems = async (filter, keys, populate = []) => {
  const items = await Item.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate)
    .lean();
  return items;
};

/**
 * Get items count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getItemsCount = async (filter) => {
  return Item.countDocuments(filter);
};

/**
 * Get item by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Item>}
 */
const getItemById = async (id, populate = []) => {
  return Item.findById(id).populate(populate);
};

/**
 * Get item with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Item>}
 */
const getItem = async (filter, populate = []) => {
  return Item.findOne(filter).populate(populate);
};

/**
 * Update item by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
const updateItem = async (filter, updateBody) => {
  const item = await getItem(filter);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  return Item.updateOne(filter, updateBody);
};

/**
 * Update item by id
 * @param {ObjectId} itemId
 * @param {Object} updateBody
 * @returns {Promise<Item>}
 */
const updateItemById = async (itemId, updateBody) => {
  const item = await getItemById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  await Item.findByIdAndUpdate(itemId, updateBody);
  return item;
};

/**
 * Delete item by id
 * @param {ObjectId} itemId
 * @param {Object} deleteBody
 * @returns {Promise<Item>}
 */
const deleteItemById = async (itemId, deleteBody) => {
  const item = await getItemById(itemId);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  await Item.findByIdAndUpdate(itemId, { ...deleteBody, isDeleted: true });
  return item;
};

module.exports = {
  createItem,
  queryItems,
  getItemById,
  updateItem,
  updateItemById,
  deleteItemById,
  getItems,
  getItemsCount,
  getItem,
};
