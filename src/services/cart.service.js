const httpStatus = require('http-status');
const { Cart } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a cart
 * @param {Object} cartBody
 * @returns {Promise<Cart>}
 */
const createCart = async (cartBody) => {
  return Cart.create(cartBody);
};

/**
 * Query for carts with pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.populate] - populate the fields (default = '')
 * @returns {Promise<QueryResult>}
 */
const queryCarts = async (filter, options) => {
  const carts = await Cart.paginate({ ...filter, isDeleted: false }, options);
  return carts;
};

/**
 * find all carts without pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} keys - result keys
 * @param {Array<string>} populate
 * @returns {Promise<QueryResult>}
 */
const getCarts = async (filter, keys, populate = []) => {
  const carts = await Cart.find({ ...filter, isDeleted: false })
    .select(keys)
    .populate(populate);
  return carts;
};

/**
 * Get carts count with filter
 * @param {Object} filter - Mongo filter
 * @returns {Integer}
 */
const getCartsCount = async (filter) => {
  return Cart.countDocuments(filter);
};

/**
 * Get cart by id
 * @param {ObjectId} id
 * @param {Array<string>} populate
 * @returns {Promise<Cart>}
 */
const getCartById = async (id, populate = []) => {
  return Cart.findById(id).populate(populate);
};

/**
 * Get cart with filter
 * @param {Object} filter
 * @param {Array<string>} populate
 * @returns {Promise<Cart>}
 */
const getCart = async (filter, populate = [], select = '') => {
  return Cart.findOne(filter).populate(populate).select(select);
};

/**
 * Update cart by filter
 * @param {Object} filter
 * @param {Object} updateBody
 * @returns {Promise<Cart>}
 */
const updateCart = async (filter, updateBody) => {
  return Cart.updateOne(filter, updateBody);
};

/**
 * Update cart by id
 * @param {ObjectId} cartId
 * @param {Object} updateBody
 * @returns {Promise<Cart>}
 */
const updateCartById = async (cartId, updateBody) => {
  const cart = await getCartById(cartId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  await Cart.findByIdAndUpdate(cartId, updateBody);
  return cart;
};

const emptyCart = async (cartId) => {
  const cart = await Cart.findByIdAndUpdate(cartId, {
    $set: {
      placeId: null,
      slotId: null,
      couponId: null,
      items: [],
      date: null,
      totalAmount: 0,
      couponDiscount: 0,
      totalAmountWithoutDiscount: 0,
      pointsDiscount: 0,
      tax: 0,
      amountToBePaid: 0,
    },
  });
  return cart;
};

/**
 * Delete cart by id
 * @param {ObjectId} cartId
 * @param {Object} deleteBody
 * @returns {Promise<Cart>}
 */
const deleteCartById = async (cartId, deleteBody) => {
  const cart = await getCartById(cartId);
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
  }
  await Cart.findByIdAndUpdate(cartId, { ...deleteBody, isDeleted: true });
  return cart;
};

module.exports = {
  createCart,
  queryCarts,
  getCartById,
  updateCart,
  updateCartById,
  deleteCartById,
  getCart,
  getCarts,
  getCartsCount,
  emptyCart,
};
