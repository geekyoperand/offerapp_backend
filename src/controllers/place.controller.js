const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { placeService, pricehistoryService, searchService, viewHistoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createPlace = catchAsync(async (req, res) => {
  // const slots = req.body.slots.map((slot) => ({ ...slot, createdBy: req.user.id }));
  const place = await placeService.createPlace({ ...req.body, managerId: req.user.id, createdBy: req.user.id });
  // const placeId = place.id;
  // const { slots } = req.body;
  // const place = await placeService.updatePlaceById(placeId, { $push: { slots: { $each: slots } } });
  // return res.status(httpStatus.CREATED).send(success('PLC010', { place }, httpStatus.CREATED));
  return res.status(httpStatus.CREATED).send(success('PLC001', { place }, httpStatus.CREATED));
});

const addSlot = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { placeId } = req.params;
  const placeCount = await placeService.getPlacesCount({
    _id: mongoose.Types.ObjectId(placeId),
    createdBy: mongoose.Types.ObjectId(userId),
  });
  if (!placeCount) return res.status(httpStatus.BAD_REQUEST).send(error('PLC009', {}, httpStatus.BAD_REQUEST));
  const slot = req.body;
  const place = await placeService.updatePlaceById(placeId, { $push: { slots: slot } });
  return res.status(httpStatus.CREATED).send(success('PLC010', { place }, httpStatus.CREATED));
});

// need to test
const updateSlot = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { placeId, slotId } = req.params;
  const placeCount = await placeService.getPlacesCount({
    _id: mongoose.Types.ObjectId(placeId),
    createdBy: mongoose.Types.ObjectId(userId),
    slots: { $elemMatch: { _id: mongoose.Types.ObjectId(slotId), isDeleted: false } },
  });
  if (!placeCount) return res.status(httpStatus.BAD_REQUEST).send(error('PLC009', {}, httpStatus.BAD_REQUEST));
  if (placeId !== req.params.placeId)
    return res.status(httpStatus.BAD_REQUEST).send(success('PLC009', {}, httpStatus.PARTIAL_CONTENT));

  const slotDataObj = {};
  Object.keys(req.body).forEach((key) => {
    slotDataObj[`slots.$.${key}`] = req.body[key];
  });
  await placeService.updatePlace(
    { _id: mongoose.Types.ObjectId(placeId), 'slots._id': mongoose.Types.ObjectId(slotId) },
    {
      $set: slotDataObj,
    }
  );
  return res.status(httpStatus.CREATED).send(success('PLC010', {}, httpStatus.CREATED));
});

const deleteSlot = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { placeId, slotId } = req.params;
  const placeCount = await placeService.getPlacesCount({
    _id: mongoose.Types.ObjectId(placeId),
    createdBy: mongoose.Types.ObjectId(userId),
    slots: { $elemMatch: { _id: mongoose.Types.ObjectId(slotId), isDeleted: false } },
  });
  if (!placeCount) return res.status(httpStatus.BAD_REQUEST).send(error('PLC009', {}, httpStatus.BAD_REQUEST));
  if (placeId !== req.params.placeId)
    return res.status(httpStatus.BAD_REQUEST).send(success('PLC009', {}, httpStatus.PARTIAL_CONTENT));

  await placeService.updatePlace(
    { _id: mongoose.Types.ObjectId(placeId), 'slots._id': mongoose.Types.ObjectId(slotId) },
    {
      $set: {
        'slots.$.isDeleted': true,
      },
    }
  );
  return res.status(httpStatus.CREATED).send(success('PLC010', {}, httpStatus.CREATED));
});

const searchPlaces = catchAsync(async (req, res) => {
  let { text, placeTypes, locations } = req.query;

  if (placeTypes) {
    placeTypes = JSON.parse(placeTypes);
  }
  if (locations) {
    locations = JSON.parse(locations);
  }
  const filter = {};
  if (text) {
    text = text.trim();
    await searchService.createSearch({ value: text, createdBy: req.user.id });
    text = text.toLowerCase();

    filter.$or = [
      { name: { $regex: text, $options: 'i' } },
      { keywords: { $regex: text, $options: 'i' } },
      // { complementaries: { $regex: text, $options: 'i' } },
      // { description: { $regex: text, $options: 'i' } },
      { locatedArea: { $regex: text, $options: 'i' } },
      { shortTagline: { $regex: text, $options: 'i' } },
      { 'tags.name': { $regex: text, $options: 'i' } },
    ];
  }

  if (placeTypes && placeTypes.length > 0) {
    filter.type = { $in: placeTypes.map((type) => mongoose.Types.ObjectId(type)) };
  }
  if (locations && locations.length > 0) {
    filter.locationId = { $in: locations.map((type) => mongoose.Types.ObjectId(type)) };
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.select = 'name logo tags locatedArea shortTagline isPublished isTemporarilyClosed';
  options.sortBy = 'isTemporarilyClosed:asc';
  const places = await placeService.queryPlaces(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('PLC008', { places }, httpStatus.PARTIAL_CONTENT));
});

const getPlaces = catchAsync(async (req, res) => {
  let filter = pick(req.query, ['name', 'categoryId']);
  let { locations } = req.query;
  const { isTypeBased } = req.query;
  if (locations) {
    locations = JSON.parse(locations);
  }
  if (filter.categoryId) {
    if (!isTypeBased) {
      filter = {
        type: { $eq: filter.categoryId },
      };
    } else {
      filter = {
        ...filter,
        $or: [
          {
            categoryId: { $elemMatch: { $eq: filter.categoryId } },
          },
          {
            type: { $eq: filter.categoryId },
          },
        ],
      };
    }
  }

  if (locations && locations.length > 0) {
    filter.locationId = { $in: locations.map((type) => mongoose.Types.ObjectId(type)) };
  }
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // options.populate = 'priceId';
  options.select = 'name logo tags locatedArea shortTagline rating isPublished'; // isTemporarilyClosed';
  // options.sortBy = 'isTemporarilyClosed:asc';
  const places = await placeService.queryPlaces(
    { ...filter, isPublished: req.isUser, isTemporarilyClosed: !req.isUser },
    options
  );
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('PLC002', { places }, httpStatus.PARTIAL_CONTENT));
});

const getPlace = catchAsync(async (req, res) => {
  const date = new Date();
  // date.setDate(date.getDate() + 8);

  const place = await placeService.getAggregatedPlaceById([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.placeId),
        isDeleted: false,
      },
    },
    {
      $unwind: {
        path: '$slots',
      },
    },
    {
      $match: {
        'slots.activeFrom': {
          $lte: new Date(new Date().setDate(new Date().getDate() + 8)),
        },
        $or: [
          {
            'slots.activeTill': undefined,
          },
          {
            'slots.activeTill': null,
          },
          {
            'slots.activeTill': {
              $gte: date,
            },
          },
          {
            'slots.isDeleted': false,
          },
        ],
        // 'slots.inactiveOn': {
        //   $ne: new Date('Sun, 19 Jun 2022 20:35:54 GMT'),
        // },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'slots.complementaries',
        foreignField: '_id',
        as: 'slots.complementaries',
      },
    },
    {
      $group: {
        _id: '$_id',
        slots: {
          $push: {
            id: '$slots._id',
            startTime: '$slots.startTime',
            endTime: '$slots.endTime',
            activeFrom: '$slots.activeFrom',
            activeTill: '$slots.activeTill',
            complementaries: '$slots.complementaries',
            inactiveOn: '$slots.inactiveOn',
            placeDescription: '$slots.placeDescription',
          },
        },
        name: {
          $first: '$name',
        },
        locatedArea: {
          $first: '$locatedArea',
        },
        location: {
          $first: '$location',
        },
        closedDays: {
          $first: '$closedDays',
        },
        specificOffDays: {
          $first: '$specificOffDays',
        },
        images: {
          $first: '$images',
        },
        rating: {
          $first: '$rating',
        },
        logo: {
          $first: '$logo',
        },
        isTemporarilyClosed: {
          $first: '$isTemporarilyClosed',
        },
        isPublished: {
          $first: '$isPublished',
        },
      },
    },
  ]);
  if (!place || place.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send(error('PLC003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
  }

  viewHistoryService
    .getViewHistoriesCount({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lte: new Date() },
      placeId: mongoose.Types.ObjectId(req.params.placeId),
      userId: mongoose.Types.ObjectId(req.user.id),
    })
    .then((count) => {
      console.log('---count---', count);
      if (!count) {
        viewHistoryService.createViewHistory({
          userId: req.user.id,
          placeId: req.params.placeId,
        });
      } else {
        viewHistoryService.updateViewHistory(
          {
            createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lte: new Date() },
            placeId: mongoose.Types.ObjectId(req.params.placeId),
            userId: mongoose.Types.ObjectId(req.user.id),
          },
          {
            createdAt: new Date(),
          }
        );
      }
    });
  return res.status(httpStatus.OK).send(success('PLC004', { place: place[0] }, httpStatus.OK));
});

const getSlots = catchAsync(async (req, res) => {
  const date = new Date();
  // date.setDate(date.getDate() + 8);

  const place = await placeService.getAggregatedPlaceById([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.placeId),
        isDeleted: false,
      },
    },
    {
      $unwind: {
        path: '$slots',
      },
    },
    {
      $match: {
        'slots.activeFrom': {
          $lte: new Date(new Date().setDate(new Date().getDate() + 8)),
        },
        $or: [
          {
            'slots.activeTill': undefined,
          },
          {
            'slots.activeTill': null,
          },
          {
            'slots.activeTill': {
              $gte: date,
            },
          },
          {
            'slots.isDeleted': false,
          },
        ],
        // 'slots.inactiveOn': {
        //   $ne: new Date('Sun, 19 Jun 2022 20:35:54 GMT'),
        // },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'slots.complementaries',
        foreignField: '_id',
        as: 'slots.complementaries',
      },
    },
    {
      $group: {
        _id: '$_id',
        slots: {
          $push: {
            id: '$slots._id',
            startTime: '$slots.startTime',
            endTime: '$slots.endTime',
            activeFrom: '$slots.activeFrom',
            activeTill: '$slots.activeTill',
            complementaries: '$slots.complementaries',
            inactiveOn: '$slots.inactiveOn',
            placeDescription: '$slots.placeDescription',
          },
        },
      },
    },
  ]);
  if (!place || place.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).send(error('PLC003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
  }

  return res.status(httpStatus.OK).send(success('PLC004', { slots: place[0].slots }, httpStatus.OK));
});

const changePrice = catchAsync(async (req, res) => {
  let place = await placeService.getPlaceById(req.params.placeId, '', ['priceId', 'managerId']);
  if (!place) {
    return res.status(httpStatus.BAD_REQUEST).send(error('PLC003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Place not found');
  }

  let priceHistory = place.priceId;
  if (req.body.entryFee && req.body.entryFee !== priceHistory.entryFee) {
    priceHistory = await pricehistoryService.createPriceHistory({
      placeId: place._id,
      entryFee: req.body.entryFee,
      managerId: place.managerId,
    });
    place = await placeService.updatePlaceById(req.params.placeId, { priceId: priceHistory._id });
  }
  return res.status(httpStatus.OK).send(success('PLC005', { priceHistory, place }, httpStatus.OK));
});

const updatePlace = catchAsync(async (req, res) => {
  const { userId } = req.user;
  let place = await placeService.getPlaceById(req.params.placeId, 'createdBy', []);
  if (userId !== place.createdBy.toString()) {
    return res.status(httpStatus.OK).send(success('PLC009', {}, httpStatus.OK));
  }
  // let priceHistory = place.priceId;
  // if (req.body.entryFee && req.body.entryFee !== priceHistory.entryFee) {
  //   priceHistory = await pricehistoryService.createPriceHistory({
  //     placeId: place._id,
  //     entryFee: req.body.entryFee,
  //     managerId: place.managerId,
  //   });
  // }
  const { slots } = req.body;
  if (slots && slots.length > 0) {
    req.body.$push = { slots: { $each: slots } };
  }
  place = await placeService.updatePlaceById(req.params.placeId, {
    ...req.body,
    // priceId: priceHistory._id,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });

  return res.status(httpStatus.OK).send(success('PLC006', { place }, httpStatus.OK));
});

const deletePlace = catchAsync(async (req, res) => {
  await placeService.deletePlaceById(req.params.placeId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('PLC007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createPlace,
  getPlaces,
  getSlots,
  getPlace,
  updatePlace,
  deletePlace,
  changePrice,
  searchPlaces,
  addSlot,
  updateSlot,
  deleteSlot,
};
