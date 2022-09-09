const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { messaging } = require('../config/firebase');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { deviceService } = require('../services');
const { success, error } = require('../utils/responseApi');

// const firebaseMessaging = getMessaging();

const payload = {
  notification: {
    title: 'You have a new message!',
    body: 'Tap to reply',
    channelId: 'rn-push-notification-channel-id-4-default-300',
  },
  // data: {
  //   score: '850',
  //   time: '2:45',
  // },
};

const createDevice = catchAsync(async (req, res) => {
  const deviceCount = await deviceService.getDevicesCount({ token: req.body.token });
  if (deviceCount) {
    return res.status(httpStatus.BAD_REQUEST).send(error('NTFN003', {}, httpStatus.BAD_REQUEST));
  }
  const device = await deviceService.createDevice({
    ...req.body,
  });
  if (req.body.oldToken) {
    deviceService.updateDevice(
      {
        token: req.body.oldToken,
      },
      { isDeleted: true }
    );
  }
  return res.status(httpStatus.CREATED).send(success('NTFN001', { device: {} }, httpStatus.CREATED));
});

const getDevices = catchAsync(async (req, res) => {
  const filter = { ...pick(req.query, ['userId', 'text', 'type']), userId: mongoose.Types.ObjectId(req.user.id) };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = [{ keys: 'placeId', select: 'logo name' }];
  options.select = 'text dateTime orderId placeId read';
  const devices = await deviceService.queryDevices(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('NTFN002', { devices }, httpStatus.PARTIAL_CONTENT));
});

const getDevice = catchAsync(async (req, res) => {
  const device = await deviceService.getDeviceById(req.params.deviceId, ['userId']);
  if (!device) {
    return res.status(httpStatus.BAD_REQUEST).send(error('NTFN003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Device not found');
  }
  return res.status(httpStatus.OK).send(success('NTFN004', { device }, httpStatus.OK));
});

const updateDevice = catchAsync(async (req, res) => {
  deviceService.updateDevice({ token: req.body.token }, { ...req.body }, { upsert: true });
  return res.status(httpStatus.OK).send(success('NTFN005', {}, httpStatus.OK));
});

const deleteDevice = catchAsync(async (req, res) => {
  await deviceService.deleteDeviceById(req.params.deviceId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('NTFN006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
};
