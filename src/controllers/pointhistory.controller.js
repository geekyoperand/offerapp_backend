const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { pointHistoryService, userService } = require('../services');
const { success, error } = require('../utils/responseApi');
const { pointTypesMessages } = require('../constants');

const createPointHistory = catchAsync(async (req, res) => {
  const { userId, points } = req.body;
  const user = await userService.updateUserById(userId, {
    $inc: { points },
  });
  const pointHistory = await pointHistoryService.createPointHistory({
    ...req.body,
    userId: req.user.id,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('PNTHSTRY001', { pointHistory }, httpStatus.CREATED));
});

const getPointHistories = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const user = await userService.getUserById(userId, 'points');
  const filter = { ...pick(req.query, ['userId', 'type']), userId: mongoose.Types.ObjectId(req.user.id) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = [
    { keys: 'placeId', select: 'name' },
    { keys: 'orderId', select: 'shortId' },
  ];
  options.select = 'type createdAt points placeId orderId';
  const pointHistories = await pointHistoryService.queryPointHistories(filter, options);
  return res
    .status(httpStatus.PARTIAL_CONTENT)
    .send(
      success('PNTHSTRY002', { pointHistories, points: user.points || 0, pointTypesMessages }, httpStatus.PARTIAL_CONTENT)
    );
});

const getPointHistory = catchAsync(async (req, res) => {
  const pointHistory = await pointHistoryService.getPointHistoryById(req.params.pointHistoryId, 'userId');
  if (!pointHistory) {
    return res.status(httpStatus.BAD_REQUEST).send(error('PNTHSTRY003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'PointHistory not found');
  }
  return res.status(httpStatus.OK).send(success('PNTHSTRY004', { pointHistory }, httpStatus.OK));
});

const updatePointHistory = catchAsync(async (req, res) => {
  const pointHistory = await pointHistoryService.updatePointHistoryById(req.params.pointHistoryId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('PNTHSTRY005', { pointHistory }, httpStatus.OK));
});

const deletePointHistory = catchAsync(async (req, res) => {
  await pointHistoryService.deletePointHistoryById(req.params.pointHistoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('PNTHSTRY006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createPointHistory,
  getPointHistories,
  getPointHistory,
  updatePointHistory,
  deletePointHistory,
};
