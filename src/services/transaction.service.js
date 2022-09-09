const httpStatus = require('http-status');
const { Transaction } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a transaction
 * @param {Object} transactionBody
 * @returns {Promise<Transaction>}
 */
const createTransaction = async (transactionBody) => {
  return Transaction.create(transactionBody);
};

/**
 * Query for transactions with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryTransactions = async (filter, options) => {
  const transactions = await Transaction.paginate({ ...filter, isDeleted: false }, options);
  return transactions;
};

/**
 * find all transactions without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getTransactions = async (filter, keys, populate = []) => {
  const transactions = await Transaction.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return transactions;
};

/**
 * Get transactions count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getTransactionsCount = async (filter) => {
  return Transaction.countDocuments(filter);
};

/**
 * Get transaction by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Transaction>}
 */
const getTransactionById = async (id, populate = []) => {
  return Transaction.findById(id).populate(populate);
};

/**
 * Get transaction with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Transaction>}
 */
const getTransaction = async (filter, populate = []) => {
  return Transaction.findOne(filter).populate(populate);
};

/**
 * Update transaction by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Transaction>}
 */
const updateTransaction = async (filter, updateBody) => {
  const transaction = await getTransaction(filter);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  return Transaction.updateOne(filter, updateBody);
};

/**
 * Update transaction by id
 * @param {ObjectId} transactionId
 * @param {Object} updateBody
 * @returns {Promise<Transaction>}
 */
const updateTransactionById = async (transactionId, updateBody) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  await Transaction.findByIdAndUpdate(transactionId, updateBody);
  return transaction;
};

/**
 * Delete transaction by id
 * @param {ObjectId} transactionId
 * @param {Object} deleteBody
 * @returns {Promise<Transaction>}
 */
const deleteTransactionById = async (transactionId, deleteBody) => {
  const transaction = await getTransactionById(transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  await Transaction.findByIdAndUpdate(transactionId, { ...deleteBody, isDeleted: true });
  return transaction;
};

module.exports = {
  createTransaction,
  queryTransactions,
  getTransactionById,
  updateTransaction,
  updateTransactionById,
  deleteTransactionById,
  getTransactions,
  getTransactionsCount,
};
