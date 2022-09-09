const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { bannerService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createBanner = catchAsync(async (req, res) => {
  const activeFrom = new Date(req.body.activeFrom);
  const activeTill = new Date(activeFrom.setMonth(activeFrom.getMonth() + 1));
  const banner = await bannerService.createBanner({ ...req.body, activeTill, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('BNR001', { banner }, httpStatus.CREATED));
});

const getBanners = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'activeFrom', 'activeTill', 'description']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const banners = await bannerService.queryBanners(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('BNR002', { banners }, httpStatus.PARTIAL_CONTENT));
});

const getActiveBanners = catchAsync(async (req, res) => {
  const keys = 'image url slug link type placeId placeSelectedDate slotId url';
  const filter = {
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
  const banners = await bannerService.getBanners(filter, keys);
  return res.status(httpStatus.OK).send(success('BNR003', { banners }, httpStatus.OK));
});

const getBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.getBannerById(req.params.bannerId);
  if (!banner) {
    return res.status(httpStatus.BAD_REQUEST).send(error('BNR004', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('BNR005', { banner }, httpStatus.OK));
});

const updateBanner = catchAsync(async (req, res) => {
  const banner = await bannerService.updateBannerById(req.params.bannerId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('BNR006', { banner }, httpStatus.OK));
});

const deleteBanner = catchAsync(async (req, res) => {
  await bannerService.deleteBannerById(req.params.bannerId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });

  return res.status(httpStatus.NO_CONTENT).send(success('BNR007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createBanner,
  getBanners,
  getActiveBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
