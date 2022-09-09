const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { itemQuantityTrackerService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createItem = catchAsync(async (req, res) => {
  const item = await itemQuantityTrackerService.createItem({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('FRM001', { item }, httpStatus.CREATED));
});

const getItems = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'code']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'fields';
  const items = await itemQuantityTrackerService.queryItems(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('FRM002', { items }, httpStatus.PARTIAL_CONTENT));
});

const getItem = catchAsync(async (req, res) => {
  const item = await itemQuantityTrackerService.getItemById(req.params.itemId);
  if (!item) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FRM003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  return res.status(httpStatus.OK).send(success('FRM004', { item }, httpStatus.OK));
});

const updateItem = catchAsync(async (req, res) => {
  const item = await itemQuantityTrackerService.updateItemById(req.params.itemId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('FRM005', { item }, httpStatus.OK));
});

const deleteItem = catchAsync(async (req, res) => {
  await itemQuantityTrackerService.deleteItemById(req.params.itemId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('FRM006', {}, httpStatus.NO_CONTENT));
});

const getUIConfig = catchAsync(async (req, res) => {
  const uiConfig = await itemQuantityTrackerService.getUIConfig({});
  return res.status(httpStatus.OK).send(success('FRM007', { uiConfig }, httpStatus.OK));
});

module.exports = {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getUIConfig,
};
