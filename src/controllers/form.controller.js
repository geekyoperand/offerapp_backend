const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { formService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createForm = catchAsync(async (req, res) => {
  const form = await formService.createForm({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('FRM001', { form }, httpStatus.CREATED));
});

const getForms = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'code']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'fields';
  const forms = await formService.queryForms(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('FRM002', { forms }, httpStatus.PARTIAL_CONTENT));
});

const getForm = catchAsync(async (req, res) => {
  const form = await formService.getFormById(req.params.formId);
  if (!form) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FRM003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Form not found');
  }
  return res.status(httpStatus.OK).send(success('FRM004', { form }, httpStatus.OK));
});

const updateForm = catchAsync(async (req, res) => {
  const form = await formService.updateFormById(req.params.formId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('FRM005', { form }, httpStatus.OK));
});

const deleteForm = catchAsync(async (req, res) => {
  await formService.deleteFormById(req.params.formId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('FRM006', {}, httpStatus.NO_CONTENT));
});

const getUIConfig = catchAsync(async (req, res) => {
  const uiConfig = await formService.getUIConfig({});
  return res.status(httpStatus.OK).send(success('FRM007', { uiConfig }, httpStatus.OK));
});

module.exports = {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
  getUIConfig,
};
