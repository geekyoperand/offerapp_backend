const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { favoriteService, placeService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createFavorite = catchAsync(async (req, res) => {
  let favorite = await favoriteService.getFavorite(
    {
      userId: mongoose.Types.ObjectId(req.user.id),
      placeId: mongoose.Types.ObjectId(req.body.placeId),
    },
    'isDeleted'
  );
  let message;

  if (favorite && !favorite.isDeleted) {
    await favoriteService.deleteFavoriteById(favorite._id);
    await placeService.updatePlaceById(req.body.placeId, {
      $inc: { favoriteCount: -1 },
    });

    message = 'FVRT001';
  } else {
    if (favorite && favorite.isDeleted) {
      await favoriteService.updateFavorite(
        {
          userId: mongoose.Types.ObjectId(req.user.id),
          placeId: mongoose.Types.ObjectId(req.body.placeId),
        },
        { isDeleted: false, updatedBy: req.user.id, updatedOn: new Date() }
      );
    } else {
      favorite = await favoriteService.createFavorite({ ...req.body, userId: req.user.id, createdBy: req.user.id });
    }

    await placeService.updatePlaceById(req.body.placeId, {
      $inc: { favoriteCount: 1 },
    });
    message = 'FVRT002';
  }
  return res.status(httpStatus.OK).send(success(message, { favorite }, httpStatus.OK));
});

const getFavorites = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['userId', 'placeId']), userId: mongoose.Types.ObjectId(req.user.id) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.select = 'placeId';
  options.populate = [
    { keys: 'placeId', select: 'name logo tags locatedArea shortTagline isPublished isTemporarilyClosed' },
  ];
  const favorites = await favoriteService.queryFavorites(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('FVRT003', { favorites }, httpStatus.PARTIAL_CONTENT));
});

const getAllFavorites = catchAsync(async (req, res) => {
  const keys = 'placeId';
  const filter = { ...pick(req.query, ['userId', 'placeId']), userId: mongoose.Types.ObjectId(req.user.id) };
  const favorites = await favoriteService.getFavorites(filter, keys);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('FVRT003', { favorites }, httpStatus.PARTIAL_CONTENT));
});

const getFavorite = catchAsync(async (req, res) => {
  const favorite = await favoriteService.getFavoriteById(req.params.favoriteId, ['placeId']);
  if (!favorite) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'Favorite not found');

    return res.status(httpStatus.BAD_REQUEST).send(error('FVRT004', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('FVRT005', { favorite }, httpStatus.OK));
});

const updateFavorite = catchAsync(async (req, res) => {
  const favorite = await favoriteService.updateFavoriteById(req.params.favoriteId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('FVRT006', { favorite }, httpStatus.OK));
});

const deleteFavorite = catchAsync(async (req, res) => {
  await favoriteService.deleteFavoriteById(req.params.favoriteId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('FVRT007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createFavorite,
  getFavorites,
  getFavorite,
  updateFavorite,
  deleteFavorite,
  getAllFavorites,
};
