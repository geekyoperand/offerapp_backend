const Joi = require('joi');
const { deviceTypes, deviceCategories } = require('../constants');
const { objectId } = require('./custom.validation');

const createDevice = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    oldToken: Joi.string().allow(null),
    location: Joi.object().keys({
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
    }),
  }),
};

const getDevices = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().custom(objectId).required(),
  }),
};

const updateDevice = {
  body: Joi.object()
    .keys({
      token: Joi.string(),
      androidId: Joi.string().allow(null).allow(''),
      apiLevel: Joi.number().allow(null),
      applicationName: Joi.string().allow(null).allow(''),
      availableLocationProviders: Joi.string().allow(null).allow(''),
      baseOs: Joi.string().allow(null).allow(''),
      buildId: Joi.string().allow(null).allow(''),
      batteryLevel: Joi.number().allow(null),
      bootloader: Joi.string().allow(null).allow(''),
      brand: Joi.string().allow(null).allow(''),
      buildNumber: Joi.string().allow(null).allow(''),
      bundleId: Joi.string().allow(null).allow(''),
      isCameraPresent: Joi.boolean(),
      carrier: Joi.string().allow(null).allow(''),
      codename: Joi.string().allow(null).allow(''),
      device: Joi.string().allow(null).allow(''),
      deviceId: Joi.string().allow(null).allow(''),
      deviceType: Joi.string().allow(null).allow(''),
      display: Joi.string().allow(null).allow(''),
      deviceName: Joi.string().allow(null).allow(''),
      deviceToken: Joi.string().allow(null).allow(''),
      firstInstallTime: Joi.number().allow(null),
      fingerprint: Joi.string().allow(null).allow(''),
      fontScale: Joi.number().allow(null),
      freeDiskStorage: Joi.number().allow(null),
      freeDiskStorageOld: Joi.number().allow(null),
      hardware: Joi.string().allow(null).allow(''),
      host: Joi.string().allow(null).allow(''),
      ipAddress: Joi.string().allow(null).allow(''),
      incremental: Joi.string().allow(null).allow(''),
      installerPackageName: Joi.string().allow(null).allow(''),
      installReferrer: Joi.string().allow(null).allow(''),
      instanceId: Joi.string().allow(null).allow(''),
      lastUpdateTime: Joi.number().allow(null),
      macAddress: Joi.string().allow(null).allow(''),
      manufacturer: Joi.string().allow(null).allow(''),
      maxMemory: Joi.number().allow(null),
      model: Joi.string().allow(null).allow(''),
      phoneNumber: Joi.string().allow(null).allow(''),
      powerState: Joi.object().keys({
        batteryLevel: Joi.number().allow(null),
        batteryState: Joi.string().allow(null).allow(''),
        lowPowerMode: Joi.boolean(),
      }),
      product: Joi.string().allow(null).allow(''),
      previewSdkInt: Joi.string().allow(null).allow(''),
      readableVersion: Joi.string().allow(null).allow(''),
      serialNumber: Joi.string().allow(null).allow(''),
      securityPatch: Joi.string().allow(null).allow(''),
      systemAvailableFeatures: Joi.array().items(Joi.string()),
      systemName: Joi.string().allow(null).allow(''),
      systemVersion: Joi.string().allow(null).allow(''),
      tags: Joi.string().allow(null).allow(''),
      type: Joi.string().allow(null).allow(''),
      totalDiskCapacity: Joi.number().allow(null),
      totalDiskCapacityOld: Joi.number().allow(null),
      totalMemory: Joi.number().allow(null),
      uniqueId: Joi.string().allow(null).allow(''),
      usedMemory: Joi.number().allow(null),
      userAgent: Joi.string().allow(null).allow(''),
      version: Joi.string().allow(null).allow(''),
      brightness: Joi.number().allow(null),
      hasGms: Joi.boolean(),
      hasHms: Joi.boolean(),
      hasNotch: Joi.boolean(),
      hasSystemFeature: Joi.boolean(),
      isAirplaneMode: Joi.boolean(),
      isBatteryCharging: Joi.boolean(),
      isEmulator: Joi.boolean(),
      isKeyboardConnected: Joi.boolean(),
      isLandscape: Joi.boolean(),
      isLocationEnabled: Joi.boolean(),
      isMouseConnected: Joi.boolean(),
      isHeadphonesConnected: Joi.boolean(),
      isPinOrFingerprintSet: Joi.boolean(),
      isTablet: Joi.boolean(),
      isTabletMode: Joi.boolean(),
      supported32BitAbis: Joi.array().items(Joi.string()),
      supported64BitAbis: Joi.array().items(Joi.string()),
      supportedAbis: Joi.array().items(Joi.string()),
      syncUniqueId: Joi.string().allow(null).allow(''),
      location: Joi.object().keys({
        longitude: Joi.number(),
        latitude: Joi.number(),
      }),
    })
    .min(1),
};

const deleteDevice = {
  params: Joi.object().keys({
    deviceId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
};
