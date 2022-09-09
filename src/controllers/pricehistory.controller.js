const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { priceHistoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createPriceHistory = catchAsync(async (req, res) => {
  const priceHistory = await priceHistoryService.createPriceHistory({
    ...req.body,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('PRCHSTRY001', { priceHistory }, httpStatus.CREATED));
});

const getPriceHistories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['placeId', 'managerId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'placeId managerId';
  const priceHistories = await priceHistoryService.queryPriceHistories(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('PRCHSTRY002', { priceHistories }, httpStatus.PARTIAL_CONTENT));
});

const getPriceHistory = catchAsync(async (req, res) => {
  const priceHistory = await priceHistoryService.getPriceHistoryById(req.params.priceHistoryId, ['placeId', 'managerId']);
  if (!priceHistory) {
    return res.status(httpStatus.BAD_REQUEST).send(error('PRCHSTRY003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'PriceHistory not found');
  }
  return res.status(httpStatus.OK).send(success('PRCHSTRY004', { priceHistory }, httpStatus.OK));
});

const updatePriceHistory = catchAsync(async (req, res) => {
  const priceHistory = await priceHistoryService.updatePriceHistoryById(req.params.priceHistoryId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('PRCHSTRY005', { priceHistory }, httpStatus.OK));
});

const deletePriceHistory = catchAsync(async (req, res) => {
  await priceHistoryService.deletePriceHistoryById(req.params.priceHistoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('PRCHSTRY006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createPriceHistory,
  getPriceHistories,
  getPriceHistory,
  updatePriceHistory,
  deletePriceHistory,
};
