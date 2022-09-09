const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { queryTicketService, deviceService } = require('../services');
const { queryTicketStatuses, queryTicketTypes } = require('../constants');
const { success, error } = require('../utils/responseApi');
const { db } = require('../config/firebase');
const { messaging } = require('../config/firebase');

const createQueryTicket = catchAsync(async (req, res) => {
  const { type } = req.body;
  let status = queryTicketStatuses.PENDING;
  if (type === queryTicketTypes.RATING) {
    status = queryTicketStatuses.NOTREQUIRED;
  }
  const queryTicket = await queryTicketService.createQueryTicket({
    ...req.body,
    status,
    userId: req.user.id,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('FDBCK001', { queryTicket }, httpStatus.CREATED));
});

const getQueryTickets = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['title', 'type', 'orderId']), userId: mongoose.Types.ObjectId(req.user.id) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.select = 'status firebaseRealtimeChatId title type placeId orderId createdAt';
  options.populate = [
    { keys: 'placeId', select: 'logo name' },
    { keys: 'orderId', select: 'shortId' },
  ];
  options.sortBy = 'createdAt:desc';
  const queryTickets = await queryTicketService.queryQueryTickets(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('FDBCK002', { queryTickets }, httpStatus.PARTIAL_CONTENT));
});

const changeQueryTicketStatus = catchAsync(async (req, res) => {
  const queryTicket = await queryTicketService.updateQueryTicketById(req.params.queryTicketId, {
    status: req.body.status,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  if (!queryTicket) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FDBCK006', {}, httpStatus.BAD_REQUEST));
  }
  if (queryTicket.userId) {
    let sendNotification = false;
    console.log('----hello--2-');
    await db.ref(`/users/${queryTicket.userId}/queries/${queryTicket.firebaseRealtimeChatId}/status`).set(req.body.status);
    const snapshot = await db
      .ref(`/users/${queryTicket.userId}/lastUnseenQueryIds/${queryTicket.firebaseRealtimeChatId}`)
      .once('value');
    const lastUnseenMessageId = snapshot.val();
    if (!lastUnseenMessageId) {
      console.log('----hello--1-');
      sendNotification = true;
      db.ref(`/users/${queryTicket.userId}/lastUnseenQueryIds/${queryTicket.firebaseRealtimeChatId}`).set(true);
    }

    if (sendNotification) {
      console.log('----hello---');
      const devices = await deviceService.getDevices(
        {
          userId: mongoose.Types.ObjectId(queryTicket.userId),
        },
        'token'
      );
      if (!(devices && devices.length > 0)) {
        return res.status(httpStatus.BAD_REQUEST).send(error('NTFN005', {}, httpStatus.BAD_REQUEST));
      }
      const message = {
        notification: {
          title: `Ticket is closed #${queryTicket.firebaseRealtimeChatId}`,
          body:
            queryTicket.type === 'FEEDBACK' || queryTicket.type === 'FEATURE_REQUEST'
              ? `Thanks for giving your valuable feedback to us.`
              : `Hope your issue has been resolved. If you're query is still not resolved please raise a new ticket`,
        },
        data: {
          page: 'Chat Support',
          params: JSON.stringify({
            chatSupportId: queryTicket.firebaseRealtimeChatId,
            userId: queryTicket.userId,
          }),
        },
        tokens: devices.map((device) => device.token),
      };

      const response = await messaging.sendMulticast(message);
      if (response.failureCount > 0) {
        response.responses.forEach(async (resp, idx) => {
          if (!resp.success) {
            console.log(devices[idx].token);
            await deviceService.deleteDeviceById(devices[idx]._id);
          }
        });
      }
    }
  }
  return res.status(httpStatus.OK).send(success('FDBCK003', { queryTicket }, httpStatus.OK));
});

const addQueryTicketComment = catchAsync(async (req, res) => {
  const createdAt = new Date();
  const _id = createdAt.getTime();
  const messages = {
    _id,
    text: req.body.text,
    isSupportUser: true,
    // image: req.body.image,
    type: req.body.image ? 'image' : 'normal_message',
    isDeleted: false,
    createdAt: createdAt.toString(),
  };
  const body = {
    $push: {
      messages,
    },
  };
  let queryTicket = await queryTicketService.getQueryTicketById(req.params.queryTicketId, 'userId firebaseRealtimeChatId');

  if (!queryTicket) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FDBCK006', {}, httpStatus.BAD_REQUEST));
  }
  if (queryTicket.userId) {
    let sendNotification = false;
    await db.ref(`/users/${queryTicket.userId}/queries/${queryTicket.firebaseRealtimeChatId}/messages/${_id}`).set(messages);
    const snapshot = await db
      .ref(`/users/${queryTicket.userId}/lastUnseenQueryIds/${queryTicket.firebaseRealtimeChatId}`)
      .once('value');
    console.log('-----', snapshot.val());
    const lastUnseenMessageId = snapshot.val();
    if (!lastUnseenMessageId) {
      sendNotification = true;
      db.ref(`/users/${queryTicket.userId}/lastUnseenQueryIds/${queryTicket.firebaseRealtimeChatId}`).set(_id);
    }

    if (sendNotification) {
      const devices = await deviceService.getDevices(
        {
          userId: mongoose.Types.ObjectId(queryTicket.userId),
        },
        'token'
      );
      if (!(devices && devices.length > 0)) {
        return res.status(httpStatus.BAD_REQUEST).send(error('NTFN005', {}, httpStatus.BAD_REQUEST));
      }
      const message = {
        notification: {
          title: `Message from chat support ${queryTicket.firebaseRealtimeChatId}`,
          body: messages.text,
        },
        data: {
          page: 'Chat Support',
          params: JSON.stringify({
            chatSupportId: queryTicket.firebaseRealtimeChatId,
            userId: queryTicket.userId,
          }),
        },
        tokens: devices.map((device) => device.token),
      };

      const response = await messaging.sendMulticast(message);
      if (response.failureCount > 0) {
        response.responses.forEach(async (resp, idx) => {
          if (!resp.success) {
            console.log(devices[idx].token);
            await deviceService.deleteDeviceById(devices[idx]._id);
          }
        });
      }
    }
  }

  queryTicket = await queryTicketService.updateQueryTicketById(req.params.queryTicketId, body);
  return res.status(httpStatus.OK).send(success('FDBCK004', { queryTicket }, httpStatus.OK));
});

const deleteQueryTicketComment = catchAsync(async (req, res) => {
  await queryTicketService.deleteQueryTicketComment(req.params.queryTicketId, {
    userId: mongoose.Types.ObjectId(req.user.id),
    _id: mongoose.Types.ObjectId(req.params.queryTicketId),
    'comments.id': mongoose.Types.ObjectId(req.params.commentId),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('FDBCK005', {}, httpStatus.NO_CONTENT));
});

const getQueryTicket = catchAsync(async (req, res) => {
  const queryTicket = await queryTicketService.getQueryTicket(
    {
      userId: mongoose.Types.ObjectId(req.user.id),
      _id: mongoose.Types.ObjectId(req.params.queryTicketId),
    },
    ['comments.commentedBy', 'userId', 'orderId']
  );
  if (!queryTicket) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FDBCK006', {}, httpStatus.BAD_REQUEST));

    // throw new ApiError(httpStatus.NOT_FOUND, 'QueryTicket not found');
  }
  return res.status(httpStatus.OK).send(success('FDBCK007', { queryTicket }, httpStatus.OK));
});

const updateQueryTicket = catchAsync(async (req, res) => {
  let queryTicket = await queryTicketService.getQueryTicket({
    userId: mongoose.Types.ObjectId(req.user.id),
    _id: mongoose.Types.ObjectId(req.params.queryTicketId),
  });

  if (!queryTicket) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FDBCK006', {}, httpStatus.BAD_REQUEST));

    // throw new ApiError(httpStatus.NOT_FOUND, 'QueryTicket not found');
  }

  if (queryTicket.status === queryTicketStatuses.CLOSED) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FDBCK008', {}, httpStatus.BAD_REQUEST));
  }
  queryTicket = await queryTicketService.updateQueryTicket(
    {
      userId: mongoose.Types.ObjectId(req.user.id),
      _id: mongoose.Types.ObjectId(req.params.queryTicketId),
    },
    { ...req.body, updatedBy: req.user.id }
  );
  return res.status(httpStatus.OK).send(success('FDBCK009', { queryTicket }, httpStatus.OK));
});

const deleteQueryTicket = catchAsync(async (req, res) => {
  const queryTicket = await getQueryTicket({
    userId: mongoose.Types.ObjectId(req.user.id),
    _id: mongoose.Types.ObjectId(req.params.queryTicketId),
  });
  if (!queryTicket) {
    return res.status(httpStatus.BAD_REQUEST).send(error('FDBCK006', {}, httpStatus.BAD_REQUEST));

    // throw new ApiError(httpStatus.NOT_FOUND, 'QueryTicket not found');
  }
  await queryTicketService.deleteQueryTicketById(req.params.queryTicketId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('FDBCK010', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createQueryTicket,
  getQueryTickets,
  getQueryTicket,
  updateQueryTicket,
  deleteQueryTicket,
  addQueryTicketComment,
  deleteQueryTicketComment,
  changeQueryTicketStatus,
};
