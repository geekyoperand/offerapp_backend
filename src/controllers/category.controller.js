const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('CTGRY001', { category }, httpStatus.CREATED));
});

const getCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'parentId', 'code']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.paginate = 'category';
  const categories = await categoryService.queryCategories(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('CTGRY002', { categories }, httpStatus.PARTIAL_CONTENT));
});

const getAllCategories = catchAsync(async (req, res) => {
  const keys = 'name code type image imgType backgroundColor imageColor backgroundImg parentId textColor';

  const filter = pick(req.query, ['name', 'parentId', 'code']);
  const categories = await categoryService.getCategories(filter, keys);
  return res.status(httpStatus.OK).send(success('CTGRY003', { categories }, httpStatus.OK));
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId, ['category']);
  if (!category) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
    return res.status(httpStatus.BAD_REQUEST).send(error('CTGRY004', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('CTGRY005', { category }, httpStatus.OK));
});

const updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategoryById(req.params.categoryId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('CTGRY006', { category }, httpStatus.OK));
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategoryById(req.params.categoryId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('CTGRY007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
};
