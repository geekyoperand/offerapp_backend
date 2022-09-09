const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { viewHistoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createViewHistory = catchAsync(async (req, res) => {
  const viewHistory = await viewHistoryService.createViewHistory({
    ...req.body,
    userId: req.user.id,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('VWHSTRY001', { viewHistory }, httpStatus.CREATED));
});

const getViewHistories = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const filter = [
    {
      $match: {
        ...pick(req.query, ['placeId']),
        userId: mongoose.Types.ObjectId(req.user.id),
        // isDeleted: false,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $lookup: {
        from: 'places',
        localField: 'placeId',
        foreignField: '_id',
        as: 'placeId',
      },
    },
    {
      $unwind: {
        path: '$placeId',
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', timezone: 'Asia/Kolkata', date: '$createdAt' } },
        places: {
          $push: {
            _id: '$placeId._id',
            name: '$placeId.name',
            logo: '$placeId.logo',
            tags: '$placeId.tags',
            locatedArea: '$placeId.locatedArea',
            shortTagline: '$placeId.shortTagline',
            isPublished: '$placeId.isPublished',
            isTemporarilyClosed: '$placeId.isTemporarilyClosed',
          },
        },
      },
    },
  ];
  const viewHistories = await viewHistoryService.queryViewHistories(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('VWHSTRY002', { viewHistories }, httpStatus.PARTIAL_CONTENT));
});

const getViewHistory = catchAsync(async (req, res) => {
  const viewHistory = await viewHistoryService.getViewHistoryById(req.params.viewHistoryId, ['userId', 'placeId']);
  if (!viewHistory) {
    return res.status(httpStatus.BAD_REQUEST).send(error('VWHSTRY003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'ViewHistory not found');
  }
  return res.status(httpStatus.OK).send(success('VWHSTRY004', { viewHistory }, httpStatus.OK));
});

const updateViewHistory = catchAsync(async (req, res) => {
  const viewHistory = await viewHistoryService.updateViewHistoryById(req.params.viewHistoryId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('VWHSTRY005', { viewHistory }, httpStatus.OK));
});

const deleteViewHistory = catchAsync(async (req, res) => {
  await viewHistoryService.deleteViewHistoryById(req.params.viewHistoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('VWHSTRY006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createViewHistory,
  getViewHistories,
  getViewHistory,
  updateViewHistory,
  deleteViewHistory,
};
