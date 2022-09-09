const httpStatus = require('http-status');
const { Field } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a field
 * @param {Object} fieldBody
 * @returns {Promise<Field>}
 */
const createField = async (fieldBody) => {
  return Field.create(fieldBody);
};

/**
 * Query for fields with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryFields = async (filter, options) => {
  const fields = await Field.paginate({ ...filter, isDeleted: false }, options);
  return fields;
};

/**
 * find all fields without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getFields = async (filter, keys, populate = []) => {
  const fields = await Field.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return fields;
};

/**
 * Get fields count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getFieldsCount = async (filter) => {
  return Field.countDocuments(filter);
};

/**
 * Get field by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Field>}
 */
const getFieldById = async (id, populate = []) => {
  return Field.findById(id).populate(populate);
};

/**
 * Get field with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Field>}
 */
const getField = async (filter, populate = []) => {
  return Field.findOne(filter).populate(populate);
};

/**
 * Update field by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Field>}
 */
const updateField = async (filter, updateBody) => {
  const field = await getField(filter);
  if (!field) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Field not found');
  }
  return Field.updateOne(filter, updateBody);
};

/**
 * Update field by id
 * @param {ObjectId} fieldId
 * @param {Object} updateBody
 * @returns {Promise<Field>}
 */
const updateFieldById = async (fieldId, updateBody) => {
  const field = await getFieldById(fieldId);
  if (!field) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Field not found');
  }
  await Field.findByIdAndUpdate(fieldId, updateBody);
  return field;
};

/**
 * Delete field by id
 * @param {ObjectId} fieldId
 * @param {Object} deleteBody
 * @returns {Promise<Field>}
 */
const deleteFieldById = async (fieldId, deleteBody) => {
  const field = await getFieldById(fieldId);
  if (!field) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Field not found');
  }
  await Field.findByIdAndUpdate(fieldId, { ...deleteBody, isDeleted: true });
  return field;
};

module.exports = {
  createField,
  queryFields,
  getFieldById,
  updateField,
  updateFieldById,
  deleteFieldById,
  getFields,
  getFieldsCount,
};
