const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');
/**
 * Create a category
 * @param {Object} categoryBody
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryBody) => {
  const category = await Category.create(categoryBody);
  clearKey(Category.collection.collectionName);
  return category;
};

/**
 * Query for categories with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryCategories = async (filter, options) => {
  const categories = await Category.paginate({ ...filter, isDeleted: false }, options);
  return categories;
};

/**
 * find all categories without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getCategories = async (filter, keys, populate = []) => {
  const categories = await Category.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate)
    .cache({ time: config.redis.timeToLive });
  return categories;
};

/**
 * Get categories count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getCategoriesCount = async (filter) => {
  return Category.countDocuments(filter);
};

/**
 * Get category by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id, populate = []) => {
  return Category.findById(id).populate(populate);
};

/**
 * Get category with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Category>}
 */
const getCategory = async (filter, populate = []) => {
  return Category.findOne(filter).populate(populate);
};

/**
 * Update category by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategory = async (filter, updateBody) => {
  let category = await getCategory(filter);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  category = Category.updateOne(filter, updateBody);
  clearKey(Category.collection.collectionName);
  return category;
};

/**
 * Update category by id
 * @param {ObjectId} categoryId
 * @param {Object} updateBody
 * @returns {Promise<Category>}
 */
const updateCategoryById = async (categoryId, updateBody) => {
  let category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  category = await Category.findByIdAndUpdate(categoryId, updateBody);
  clearKey(Category.collection.collectionName);
  return category;
};

/**
 * Delete category by id
 * @param {ObjectId} categoryId
 * @param {Object} deleteBody
 * @returns {Promise<Category>}
 */
const deleteCategoryById = async (categoryId, deleteBody) => {
  let category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  category = await Category.findByIdAndUpdate(categoryId, { ...deleteBody, isDeleted: true });
  clearKey(Category.collection.collectionName);
  return category;
};

module.exports = {
  createCategory,
  queryCategories,
  getCategoryById,
  updateCategory,
  updateCategoryById,
  deleteCategoryById,
  getCategories,
  getCategoriesCount,
  getCategory,
};
