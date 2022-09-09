const httpStatus = require('http-status');
const { QueryTicket } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a queryTicket
 * @param {Object} queryTicketBody
 * @returns {Promise<QueryTicket>}
 */
const createQueryTicket = async (queryTicketBody) => {
  return QueryTicket.create(queryTicketBody);
};

/**
 * Query for queryTickets with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryQueryTickets = async (filter, options) => {
  const queryTickets = await QueryTicket.paginate({ ...filter, isDeleted: false }, options);
  return queryTickets;
};

/**
 * find all queryTickets without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getQueryTickets = async (filter, keys, populate = []) => {
  const queryTickets = await QueryTicket.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return queryTickets;
};

/**
 * Get queryTickets count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getQueryTicketsCount = async (filter) => {
  return QueryTicket.countDocuments(filter);
};

/**
 * Get queryTicket by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<QueryTicket>}
 */
const getQueryTicketById = async (id, keys = '', populate = []) => {
  return QueryTicket.findById(id).select(keys).populate(populate);
};

/**
 * Get queryTicket with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<QueryTicket>}
 */
const getQueryTicket = async (filter, select = '', populate = []) => {
  return QueryTicket.findOne(filter).select(select).populate(populate);
};

/**
 * Update queryTicket by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<QueryTicket>}
 */
const updateQueryTicket = async (filter, updateBody) => {
  const queryTicket = await getQueryTicket(filter);
  if (!queryTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'QueryTicket not found');
  }
  return QueryTicket.updateOne(filter, updateBody);
};

/**
 * Update queryTicket by id
 * @param {ObjectId} queryTicketId
 * @param {Object} updateBody
 * @returns {Promise<QueryTicket>}
 */
const updateQueryTicketById = async (queryTicketId, updateBody) => {
  const queryTicket = await getQueryTicketById(queryTicketId);
  if (!queryTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'QueryTicket not found');
  }
  await QueryTicket.findByIdAndUpdate(queryTicketId, updateBody);
  return queryTicket;
};

/**
 * Delete queryTicket by id
 * @param {ObjectId} queryTicketId
 * @param {Object} deleteBody
 * @returns {Promise<QueryTicket>}
 */
const deleteQueryTicketById = async (queryTicketId, deleteBody) => {
  const queryTicket = await QueryTicket.findByIdAndUpdate(queryTicketId, { ...deleteBody, isDeleted: true });
  return queryTicket;
};

/**
 * Delete queryTicket by id
 * @param {ObjectId} queryTicketId
 * @param {Object} deleteBody
 * @returns {Promise<QueryTicket>}
 */
const deleteQueryTicketComment = async (queryTicketId, deleteBody) => {
  const queryTicket = await getQueryTicketById(queryTicketId);
  if (!queryTicket) {
    throw new ApiError(httpStatus.NOT_FOUND, 'QueryTicket not found');
  }
  await QueryTicket.findByIdAndUpdate(deleteBody, {
    $set: {
      'comments.$.isDeleted': true,
    },
  });
  return queryTicket;
};

module.exports = {
  createQueryTicket,
  queryQueryTickets,
  getQueryTicketById,
  updateQueryTicket,
  updateQueryTicketById,
  deleteQueryTicketById,
  getQueryTickets,
  getQueryTicket,
  getQueryTicketsCount,
  deleteQueryTicketComment,
};
