const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { fieldService, formService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createField = catchAsync(async (req, res) => {
  const field = await fieldService.createField({
    ...req.body,
    createdBy: req.user.id,
  });
  await formService.updateFormById(req.body.formId, {
    fields: { $push: field._id, updatedBy: req.user.id },
  });
  return res.status(httpStatus.CREATED).send(success('FLD001', { field }, httpStatus.CREATED));
});

const getFields = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['code', 'label', 'type', 'required', 'language', 'formId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'formId';
  const fields = await fieldService.queryFields(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('FLD002', { fields }, httpStatus.PARTIAL_CONTENT));
});

const getField = catchAsync(async (req, res) => {
  const field = await fieldService.getFieldById(req.params.fieldId, ['formId']);
  if (!field) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FLD003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Field not found');
  }
  return res.status(httpStatus.OK).send(success('FLD004', { field }, httpStatus.OK));
});

const updateField = catchAsync(async (req, res) => {
  const field = await fieldService.updateFieldById(req.params.fieldId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });

  return res.status(httpStatus.OK).send(success('FLD005', { field }, httpStatus.OK));
});

const deleteField = catchAsync(async (req, res) => {
  await fieldService.deleteFieldById(req.params.fieldId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('FLD006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createField,
  getFields,
  getField,
  updateField,
  deleteField,
};
