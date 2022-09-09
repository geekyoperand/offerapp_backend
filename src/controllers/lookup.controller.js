const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { lookupService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createLookup = catchAsync(async (req, res) => {
  const lookup = await lookupService.createLookup({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('LKP001', { lookup }, httpStatus.CREATED));
});

const getLookups = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'description', 'code', 'value']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const lookups = await lookupService.queryLookups(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('LKP002', { lookups }, httpStatus.PARTIAL_CONTENT));
});

const getAllLookups = catchAsync(async (req, res) => {
  const keys = 'name parentId code';
  const filter = pick(req.query, ['category', 'description', 'code', 'value']);
  const lookups = await lookupService.getLookups(filter, keys);
  return res.status(httpStatus.OK).send(success('LKP003', { lookups }, httpStatus.OK));
});

const getLookup = catchAsync(async (req, res) => {
  const lookup = await lookupService.getLookupById(req.params.lookupId);
  if (!lookup) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'Lookup not found');

    return res.status(httpStatus.BAD_REQUEST).send(error('LKP004', {}, httpStatus.BAD_REQUEST));
  }

  return res.status(httpStatus.OK).send(success('LKP005', { lookup }, httpStatus.OK));
});

const updateLookup = catchAsync(async (req, res) => {
  const lookup = await lookupService.updateLookupById(req.params.lookupId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('LKP006', { lookup }, httpStatus.OK));
});

const deleteLookup = catchAsync(async (req, res) => {
  await lookupService.deleteLookupById(req.params.lookupId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('LKP007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createLookup,
  getLookups,
  getLookup,
  updateLookup,
  deleteLookup,
  getAllLookups,
};
