const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { notificationService, deviceService } = require('../services');
const { success, error } = require('../utils/responseApi');
const { messaging } = require('../config/firebase');

const createNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.createNotification({
    ...req.body,
    userId: req.user.id,
    createdBy: req.user.id,
  });
  return res.status(httpStatus.CREATED).send(success('NTFN001', { notification }, httpStatus.CREATED));
});

const getNotifications = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['userId', 'text', 'type']), userId: mongoose.Types.ObjectId(req.user.id) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = [
    { keys: 'placeId', select: 'logo name' },
    { keys: 'orderId', select: 'shortId amountToBePaid' },
  ];
  options.select = 'text dateTime orderId placeId read';
  const notifications = await notificationService.queryNotifications(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('NTFN002', { notifications }, httpStatus.PARTIAL_CONTENT));
});

const getNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.notificationId, ['userId']);
  if (!notification) {
    return res.status(httpStatus.BAD_REQUEST).send(error('NTFN003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  return res.status(httpStatus.OK).send(success('NTFN004', { notification }, httpStatus.OK));
});

const markNotificationsAsRead = catchAsync(async (req, res) => {
  const { notificationIds } = req.body;
  const notification = await notificationService.updateNotifications(
    {
      _id: { $in: notificationIds.map((id) => mongoose.Types.ObjectId(id)) },
    },
    {
      read: true,
      updatedBy: req.user.id,
      updatedOn: new Date(),
    }
  );
  return res.status(httpStatus.OK).send(success('NTFN005', { notification }, httpStatus.OK));
});

const updateNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.updateNotificationById(req.params.notificationId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('NTFN005', { notification }, httpStatus.OK));
});

const sendNotification = catchAsync(async (req, res) => {
  const { title, body, data } = req.body;
  const dataKeys = Object.keys(data);
  dataKeys.forEach((key) => {
    data[key] = typeof data[key] !== 'string' ? JSON.stringify(data[key]) : data[key];
  });
  const message = {
    notification: {
      title,
      body,
    },
    data,
    topic: 'dayout',
  };
  const response = await messaging.send(message);
  return res.status(httpStatus.OK).send(success('NTFN005', { response }, httpStatus.OK));
});

const sendNotificationUsers = catchAsync(async (req, res) => {
  const { title, body, data, userIds } = req.body;
  const dataKeys = Object.keys(data);
  dataKeys.forEach((key) => {
    data[key] = typeof data[key] !== 'string' ? JSON.stringify(data[key]) : data[key];
  });
  const devices = await deviceService.getDevices(
    {
      userId: { $in: userIds.map((userId) => mongoose.Types.ObjectId(userId)) },
    },
    'token'
  );
  if (!(devices && devices.length > 0)) {
    return res.status(httpStatus.BAD_REQUEST).send(error('NTFN005', {}, httpStatus.BAD_REQUEST));
  }
  const message = {
    notification: {
      title,
      body,
    },
    data,
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
  return res.status(httpStatus.OK).send(success('NTFN005', { response }, httpStatus.OK));
});

const deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotificationById(req.params.notificationId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('NTFN006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  markNotificationsAsRead,
  sendNotification,
  sendNotificationUsers,
  deleteNotification,
};
