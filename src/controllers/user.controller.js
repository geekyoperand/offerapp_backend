const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  return res.status(httpStatus.CREATED).send(success('USR001', { user }, httpStatus.CREATED));
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = '';
  const users = await userService.queryUsers(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('USR002', { users }, httpStatus.PARTIAL_CONTENT));
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId, ['referby']);
  if (!user) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    return res.status(httpStatus.BAD_REQUEST).send(error('USR003', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('USR004', { user }, httpStatus.OK));
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  return res.status(httpStatus.OK).send(success('USR005', { user }, httpStatus.OK));
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  return res.status(httpStatus.NO_CONTENT).send(success('USR006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
