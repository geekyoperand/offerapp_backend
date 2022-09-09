const httpStatus = require('http-status');
const { Order } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  return Order.create(orderBody);
};

/**
 * Create a order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const aggregateOrder = async (aggregationBody) => {
  return Order.aggregate(aggregationBody);
};

/**
 * Query for orders with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryOrders = async (filter, options) => {
  const orders = await Order.aggregatePaginate(
    Order.aggregate(filter),
    options
  );
  // Order.paginate({ ...filter, isDeleted: false }, options);
  return orders;
};

/**
 * find all orders without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getOrders = async (filter, keys, populate = []) => {
  const orders = await Order.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return orders;
};

/**
 * Get orders count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getOrdersCount = async (filter) => {
  return Order.countDocuments(filter);
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Order>}
 */
const getOrderById = async (id, populate = []) => {
  return Order.findById(id).populate(populate);
};

/**
 * Get order with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Order>}
 */
const getOrder = async (filter, select = '', populate = []) => {
  return Order.findOne(filter).select(select).populate(populate);
};

/**
 * Update order by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrder = async (filter, updateBody) => {
  const order = await getOrder(filter);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return Order.updateOne(filter, updateBody);
};

/**
 * Update order by id
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  await Order.findByIdAndUpdate(orderId, updateBody);
  return order;
};

/**
 * Delete order by id
 * @param {ObjectId} orderId
 * @param {Object} deleteBody
 * @returns {Promise<Order>}
 */
const deleteOrderById = async (orderId, deleteBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  await Order.findByIdAndUpdate(orderId, { ...deleteBody, isDeleted: true });
  return order;
};

module.exports = {
  createOrder,
  queryOrders,
  getOrderById,
  updateOrder,
  updateOrderById,
  deleteOrderById,
  getOrders,
  getOrdersCount,
  getOrder,
  aggregateOrder,
};
