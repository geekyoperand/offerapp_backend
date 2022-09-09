const mongoose = require('mongoose');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { itemService, placeService, itemQuantityTrackerService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createItem = catchAsync(async (req, res) => {
  const item = await itemService.createItem({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('FRM001', { item }, httpStatus.CREATED));
});

// const getItems = catchAsync(async (req, res) => {
//   const filter = pick(req.query, ['name', 'code']);
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   options.populate = 'fields';
//   const items = await itemService.queryItems(filter, options);
//   return res.status(httpStatus.PARTIAL_CONTENT).send(success('FRM002', { items }, httpStatus.PARTIAL_CONTENT));
// });

const getItems = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['placeId', 'sortId']);
  // const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // options.populate = 'fields';
  const keys =
    'name description activeFrom activeTill type categoryId originalPrice currentPrice tax extraCharges initialQuantity isActive specialDays isQuantityDependent';
  const { placeId, slotId, date } = req.query;
  let items = await itemService.getItems(
    { placeId: mongoose.Types.ObjectId(placeId), slotId: mongoose.Types.ObjectId(slotId) },
    keys
  );

  const itemQuantity = {};

  const itemWithQntities = items.filter((item) => {
    const { specialDays, isQuantityDependent, initialQuantity } = item;
    const specialDay = specialDays.find((ele) => new Date(ele.date) === new Date(date));
    if ((specialDay && !specialDay.isQuantityDependent) || (!specialDay && !isQuantityDependent)) {
      return false;
    }
    itemQuantity[item._id.toString()] = specialDay ? specialDay.initialQuantity : initialQuantity;
    return true;
  });
  console.log('---date---1-', date);
  console.log('---date---11-', itemWithQntities, new Date(new Date(date).setHours(0, 0, 0, 0)));
  const itemQuantities = await itemQuantityTrackerService.getItemQuantityTrackers({
    date: new Date(new Date(date).setHours(0, 0, 0, 0)),
    slotId: mongoose.Types.ObjectId(slotId),
    itemId: { $in: itemWithQntities.map((item) => mongoose.Types.ObjectId(item._id)) },
    placeId,
  });

  console.log('---date----', itemQuantities.length);

  itemQuantities.forEach((itemQnty) => {
    itemQuantity[itemQnty.itemId.toString()] = itemQnty.remainingQuantity;
  });

  items = items.map((item) => {
    const { specialDays, isQuantityDependent } = item;
    const specialDay = specialDays.find((ele) => new Date(ele.date) === new Date(date));
    if ((specialDay && !specialDay.isQuantityDependent) || (!specialDay && !isQuantityDependent)) {
      return {
        ...item,
        id: item._id,
        isQuantityDependent: false,
        originalPrice: specialDay ? specialDay.originalPrice : item.originalPrice,
        currentPrice: specialDay ? specialDay.currentPrice : item.currentPrice,
      };
    }
    return {
      ...item,
      id: item._id,
      isQuantityDependent: true,
      quantity: itemQuantity[item._id.toString()],
      originalPrice: specialDay ? specialDay.originalPrice : item.originalPrice,
      currentPrice: specialDay ? specialDay.currentPrice : item.currentPrice,
    };
  });

  return res.status(httpStatus.OK).send(success('FRM002', { items, itemQuantity }, httpStatus.OK));
});

const getItem = catchAsync(async (req, res) => {
  const item = await itemService.getItemById(req.params.itemId);
  if (!item) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FRM003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  return res.status(httpStatus.OK).send(success('FRM004', { item }, httpStatus.OK));
});

const updateItem = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { placeId } = req.query;
  const placeCount = await placeService.getPlacesCount({
    _id: mongoose.Types.ObjectId(placeId),
    createdBy: mongoose.Types.ObjectId(userId),
  });
  if (!placeCount) return res.status(httpStatus.BAD_REQUEST).send(error('PLC009', {}, httpStatus.BAD_REQUEST));
  const item = await itemService.updateItemById(req.params.itemId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('FRM005', { item }, httpStatus.OK));
});

const deleteItem = catchAsync(async (req, res) => {
  const { userId } = req.user;

  await itemService.deleteItemById(req.params.itemId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('FRM006', {}, httpStatus.NO_CONTENT));
});

const getUIConfig = catchAsync(async (req, res) => {
  const uiConfig = await itemService.getUIConfig({});
  return res.status(httpStatus.OK).send(success('FRM007', { uiConfig }, httpStatus.OK));
});

module.exports = {
  createItem,
  getItems,
  // fetchItemsByPlace,
  getItem,
  updateItem,
  deleteItem,
  getUIConfig,
};
