const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
const { refferalTypesMessages } = require('../constants');
const catchAsync = require('../utils/catchAsync');
const { refferalHistoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createRefferalHistory = catchAsync(async (req, res) => {
  const refferalHistory = await refferalHistoryService.createRefferalHistory({
    ...req.body,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('RFFRLHSTRY001', { refferalHistory }, httpStatus.CREATED));
});

const getRefferalHistories = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['refferedUserId', 'userId', 'type']), userId: mongoose.Types.ObjectId(req.user.id) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = [{ keys: 'refferedUserId', select: 'firstName lastName' }];
  options.select = 'refferedUserId type createdAt';
  const refferalHistories = await refferalHistoryService.queryRefferalHistories(filter, options);
  return res
    .status(httpStatus.PARTIAL_CONTENT)
    .send(success('RFFRLHSTRY002', { refferalHistories, refferalTypesMessages }, httpStatus.PARTIAL_CONTENT));
});

const getRefferalHistory = catchAsync(async (req, res) => {
  const refferalHistory = await refferalHistoryService.getRefferalHistoryById(req.params.refferalHistoryId, ['from', 'to']);
  if (!refferalHistory) {
    return res.status(httpStatus.BAD_REQUEST).send(error('RFFRLHSTRY003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'RefferalHistory not found');
  }
  return res.status(httpStatus.OK).send(success('RFFRLHSTRY004', { refferalHistory }, httpStatus.OK));
});

const updateRefferalHistory = catchAsync(async (req, res) => {
  const refferalHistory = await refferalHistoryService.updateRefferalHistoryById(req.params.refferalHistoryId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });

  return res.status(httpStatus.OK).send(success('RFFRLHSTRY005', { refferalHistory }, httpStatus.OK));
});

const deleteRefferalHistory = catchAsync(async (req, res) => {
  await refferalHistoryService.deleteRefferalHistoryById(req.params.refferalHistoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('RFFRLHSTRY006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createRefferalHistory,
  getRefferalHistories,
  getRefferalHistory,
  updateRefferalHistory,
  deleteRefferalHistory,
};
