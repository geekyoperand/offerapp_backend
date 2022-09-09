const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { couponAppliedHistoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createCouponAppliedHistory = catchAsync(async (req, res) => {
  const couponAppliedHistory = await couponAppliedHistoryService.createCouponAppliedHistory({
    ...req.body,
    userId: req.user.id,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('CPNHSTRY001', { couponAppliedHistory }, httpStatus.CREATED));
});

const getCouponAppliedHistories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userId', 'orderId', 'couponId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'userId couponId orderId';
  const couponAppliedHistories = await couponAppliedHistoryService.queryCouponAppliedHistories(filter, options);
  res
    .status(httpStatus.PARTIAL_CONTENT)
    .send(success('CPNHSTRY002', { couponAppliedHistories }, httpStatus.PARTIAL_CONTENT));
});

const getCouponAppliedHistory = catchAsync(async (req, res) => {
  const couponAppliedHistory = await couponAppliedHistoryService.getCouponAppliedHistoryById(
    req.params.couponAppliedHistoryId,
    ['userId orderId couponId']
  );
  if (!couponAppliedHistory) {
    return res.status(httpStatus.BAD_REQUEST).send(error('CPNHSTRY003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'CouponAppliedHistory not found');
  }
  return res.status(httpStatus.OK).send(success('CPNHSTRY004', { couponAppliedHistory }, httpStatus.OK));
});

const updateCouponAppliedHistory = catchAsync(async (req, res) => {
  const couponAppliedHistory = await couponAppliedHistoryService.updateCouponAppliedHistoryById(
    req.params.couponAppliedHistoryId,
    req.body
  );
  return res.status(httpStatus.OK).send(success('CPNHSTRY005', { couponAppliedHistory }, httpStatus.OK));
});

const deleteCouponAppliedHistory = catchAsync(async (req, res) => {
  await couponAppliedHistoryService.deleteCouponAppliedHistoryById(req.params.couponAppliedHistoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('CPNHSTRY006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createCouponAppliedHistory,
  getCouponAppliedHistories,
  getCouponAppliedHistory,
  updateCouponAppliedHistory,
  deleteCouponAppliedHistory,
};
