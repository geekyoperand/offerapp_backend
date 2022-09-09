const httpStatus = require('http-status');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { messageService } = require('../services');
const { success, error } = require('../utils/responseApi');

const createMessage = catchAsync(async (req, res) => {
  const message = await messageService.createMessage({ ...req.body, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('MSG001', { message }, httpStatus.CREATED));
});

const getMessages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['code', 'text']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const messages = await messageService.queryMessages(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('MSG002', { messages }, httpStatus.PARTIAL_CONTENT));
});

const getAllMessages = catchAsync(async (req, res) => {
  const keys = 'text code';
  const filter = pick(req.query, ['code', 'text']);
  const messages = await messageService.getMessages(filter, keys);
  return res.status(httpStatus.OK).send(success('MSG003', { messages }, httpStatus.OK));
});

const getMessage = catchAsync(async (req, res) => {
  const message = await messageService.getMessageById(req.params.messageId);
  if (!message) {
    return res.status(httpStatus.BAD_REQUEST).send(error('MSG004', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Message not found');
  }
  return res.status(httpStatus.OK).send(success('MSG005', { message }, httpStatus.OK));
});

const updateMessage = catchAsync(async (req, res) => {
  const message = await messageService.updateMessageById(req.params.messageId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('MSG006', { message }, httpStatus.OK));
});

const deleteMessage = catchAsync(async (req, res) => {
  await messageService.deleteMessageById(req.params.messageId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('MSG007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createMessage,
  getMessages,
  getMessage,
  updateMessage,
  deleteMessage,
  getAllMessages,
};
