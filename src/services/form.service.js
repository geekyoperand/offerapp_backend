const httpStatus = require('http-status');
const { Form } = require('../models');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const { clearKey } = require('./cache.service');
/**
 * Create a form
 * @param {Object} formBody
 * @returns {Promise<Form>}
 */
const createForm = async (formBody) => {
  const form = await Form.create(formBody);
  clearKey(Form.collection.collectionName);
  return form;
};

/**
 * Query for forms with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryForms = async (filter, options) => {
  const forms = await Form.paginate({ ...filter, isDeleted: false }, options);
  return forms;
};

/**
 * find all forms without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getForms = async (filter, keys, populate = []) => {
  const forms = await Form.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return forms;
};

/**
 * Get forms count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getFormsCount = async (filter) => {
  return Form.countDocuments(filter);
};

/**
 * Get form by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Form>}
 */
const getFormById = async (id, populate = []) => {
  return Form.findById(id).populate(populate);
};

/**
 * Get form with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Form>}
 */
const getForm = async (filter, populate = []) => {
  return Form.findOne(filter).populate(populate);
};

/**
 * Update form by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Form>}
 */
const updateForm = async (filter, updateBody) => {
  let form = await getForm(filter);
  if (!form) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
  }
  form = Form.updateOne(filter, updateBody);
  clearKey(Form.collection.collectionName);
  return form;
};

/**
 * Update form by id
 * @param {ObjectId} formId
 * @param {Object} updateBody
 * @returns {Promise<Form>}
 */
const updateFormById = async (formId, updateBody) => {
  let form = await getFormById(formId);
  if (!form) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
  }
  form = await Form.findByIdAndUpdate(formId, updateBody);
  clearKey(Form.collection.collectionName);
  return form;
};

/**
 * Delete form by id
 * @param {ObjectId} formId
 * @param {Object} deleteBody
 * @returns {Promise<Form>}
 */
const deleteFormById = async (formId, deleteBody) => {
  let form = await getFormById(formId);
  if (!form) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
  }
  form = await Form.findByIdAndUpdate(formId, { ...deleteBody, isDeleted: true });
  clearKey(Form.collection.collectionName);
  return form;
};

/**
 * Delete form by id
 * @param {ObjectId} formId
 * @param {Object} deleteBody
 * @returns {Promise<Form>}
 */
const getUIConfig = async (filter) => {
  return Form.find({ ...filter, isDeleted: false }, 'name code')
    .populate('fields')
    .cache({ time: config.redis.timeToLive });
};

module.exports = {
  createForm,
  queryForms,
  getFormById,
  updateForm,
  updateFormById,
  deleteFormById,
  getForms,
  getFormsCount,
  getUIConfig,
};
