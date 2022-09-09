const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bannerService, categoryService, placeService } = require('../services');
const { success } = require('../utils/responseApi');
const { categoryTypes } = require('../constants');

const getServerStatus = catchAsync(async (req, res) => {
  return res.status(httpStatus.OK).send(success('HM001;', {}, httpStatus.OK));
});

const getHomeDetails = catchAsync(async (req, res) => {
  const keys = 'image url slug link type placeId placeSelectedDate slotId url';
  const getBannersFilter = {
    ...req.query,
    activeFrom: {
      $lte: new Date(),
    },
    $or: [
      {
        activeTill: null,
      },
      {
        activeTill: { $gte: new Date() },
      },
    ],
  };
  const banners = await bannerService.getBanners(getBannersFilter, keys);

  const categoriesData = {};
  const categories = await categoryService.getCategories(
    {
      type: categoryTypes.CTGRY002_RIGHT_HOME_LIST_VIEW,
    },
    'code'
  );
  // eslint-disable-next-line no-restricted-syntax
  for (const category of categories) {
    const places = await placeService.getPlaces(
      { categoryId: { $elemMatch: { $eq: category.id } }, isPublished: true, isTemporarilyClosed: false },
      'name logo',
      [],
      5
    );
    categoriesData[category.code] = places;
  }

  return res.status(httpStatus.OK).send(success('BNR003', { banners, categoriesData }, httpStatus.OK));
});

module.exports = {
  getHomeDetails,
  getServerStatus,
};
