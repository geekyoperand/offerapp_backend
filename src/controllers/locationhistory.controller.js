const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { locationHistoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createLocationHistory = catchAsync(async (req, res) => {
  const locationHistory = await locationHistoryService.createLocationHistory({
    ...req.body,
    userId: req.user.id,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('LCTN001', { locationHistory }, httpStatus.CREATED));
});

const getLocationHistories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['longitude', 'latitude', 'place', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'userId';
  const locationHistories = await locationHistoryService.queryLocationHistories(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('LCTN002', { locationHistories }, httpStatus.PARTIAL_CONTENT));
});

const getLocationHistory = catchAsync(async (req, res) => {
  const locationHistory = await locationHistoryService.getLocationHistoryById(req.params.locationHistoryId, ['userId']);
  if (!locationHistory) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'LocationHistory not found');
    return res.status(httpStatus.BAD_REQUEST).send(error('LCTN003', {}, httpStatus.BAD_REQUEST));
  }

  return res.status(httpStatus.OK).send(success('LCTN004', { locationHistory }, httpStatus.OK));
});

const updateLocationHistory = catchAsync(async (req, res) => {
  const locationHistory = await locationHistoryService.updateLocationHistoryById(req.params.locationHistoryId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('LCTN005', { locationHistory }, httpStatus.OK));
});

const deleteLocationHistory = catchAsync(async (req, res) => {
  await locationHistoryService.deleteLocationHistoryById(req.params.locationHistoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('LCTN006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createLocationHistory,
  getLocationHistories,
  getLocationHistory,
  updateLocationHistory,
  deleteLocationHistory,
};
