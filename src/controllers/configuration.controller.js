const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { configurationService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createConfiguration = catchAsync(async (req, res) => {
  const configuration = await configurationService.createConfiguration({
    ...req.body,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('CNFGRTN001', { configuration }, httpStatus.CREATED));
});

const getConfigurations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'code', 'value']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const configurations = await configurationService.queryConfigurations(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('CNFGRTN002', { configurations }, httpStatus.PARTIAL_CONTENT));
});

const getAllConfigurations = catchAsync(async (req, res) => {
  const keys = 'name code value';
  const filter = pick(req.query, ['name', 'code', 'value']);
  const configurations = await configurationService.getConfigurations(filter, keys);
  return res.status(httpStatus.OK).send(success('CNFGRTN003', { configurations }, httpStatus.OK));
});

const getConfiguration = catchAsync(async (req, res) => {
  const configuration = await configurationService.getConfigurationById(req.params.configurationId);
  if (!configuration) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'Configuration not found');
    return res.status(httpStatus.BAD_REQUEST).send(error('CNFGRTN004', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('CNFGRTN005', { configuration }, httpStatus.OK));
});

const updateConfiguration = catchAsync(async (req, res) => {
  const configuration = await configurationService.updateConfigurationById(req.params.configurationId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('CNFGRTN006', { configuration }, httpStatus.OK));
});

const deleteConfiguration = catchAsync(async (req, res) => {
  await configurationService.deleteConfigurationById(req.params.configurationId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('CNFGRTN007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createConfiguration,
  getConfigurations,
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getAllConfigurations,
};
