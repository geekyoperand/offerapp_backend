const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { searchService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createSearch = catchAsync(async (req, res) => {
  const search = await searchService.createSearch({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('BNR001', { search }, httpStatus.CREATED));
});

const getSearches = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const searches = await searchService.querySearches(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('BNR002', { searches }, httpStatus.PARTIAL_CONTENT));
});

const getSearch = catchAsync(async (req, res) => {
  const search = await searchService.getSearchById(req.params.searchId);
  if (!search) {
    return res.status(httpStatus.BAD_REQUEST).send(error('BNR004', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('BNR005', { search }, httpStatus.OK));
});

const updateSearch = catchAsync(async (req, res) => {
  const search = await searchService.updateSearchById(req.params.searchId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('BNR006', { search }, httpStatus.OK));
});

const deleteSearch = catchAsync(async (req, res) => {
  await searchService.deleteSearchById(req.params.searchId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });

  return res.status(httpStatus.NO_CONTENT).send(success('BNR007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createSearch,
  getSearches,
  getSearch,
  updateSearch,
  deleteSearch,
};
