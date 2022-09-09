const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const deviceSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    token: {
      type: String,
      required: true,
    },
    location: {
      longitude: { type: String },
      latitude: { type: String },
    },
    androidId: { type: String },
    apiLevel: { type: Number },
    applicationName: { type: String },
    availableLocationProviders: { type: String },
    baseOs: { type: String },
    buildId: { type: String },
    batteryLevel: { type: Number },
    bootloader: { type: String },
    brand: { type: String },
    buildNumber: { type: String },
    bundleId: { type: String },
    isCameraPresent: { type: Boolean },
    carrier: { type: String },
    codename: { type: String },
    device: { type: String },
    deviceId: { type: String },
    deviceType: { type: String },
    display: { type: String },
    deviceName: { type: String },
    deviceToken: { type: String },
    firstInstallTime: { type: Number },
    fingerprint: { type: String },
    fontScale: { type: Number },
    freeDiskStorage: { type: Number },
    freeDiskStorageOld: { type: Number },
    hardware: { type: String },
    host: { type: String },
    ipAddress: { type: String },
    incremental: { type: String },
    installerPackageName: { type: String },
    installReferrer: { type: String },
    instanceId: { type: String },
    lastUpdateTime: { type: Number },
    macAddress: { type: String },
    manufacturer: { type: String },
    maxMemory: { type: Number },
    model: { type: String },
    phoneNumber: { type: String },
    powerState: {
      batteryLevel: { type: Number },
      batteryState: { type: String },
      lowPowerMode: { type: Boolean },
    },
    product: { type: String },
    previewSdkInt: { type: String },
    readableVersion: { type: String },
    serialNumber: { type: String },
    securityPatch: { type: String },
    systemAvailableFeatures: [{ type: String }],
    systemName: { type: String },
    systemVersion: { type: String },
    tags: { type: String },
    type: { type: String },
    totalDiskCapacity: { type: Number },
    totalDiskCapacityOld: { type: Number },
    totalMemory: { type: Number },
    uniqueId: { type: String },
    usedMemory: { type: Number },
    userAgent: { type: String },
    version: { type: String },
    brightness: { type: Number },
    hasGms: { type: Boolean },
    hasHms: { type: Boolean },
    hasNotch: { type: Boolean },
    hasSystemFeature: { type: Boolean },
    isAirplaneMode: { type: Boolean },
    isBatteryCharging: { type: Boolean },
    isEmulator: { type: Boolean },
    isKeyboardConnected: { type: Boolean },
    isLandscape: { type: Boolean },
    isLocationEnabled: { type: Boolean },
    isMouseConnected: { type: Boolean },
    isHeadphonesConnected: { type: Boolean },
    isPinOrFingerprintSet: { type: Boolean },
    isTablet: { type: Boolean },
    isTabletMode: { type: Boolean },
    supported32BitAbis: [{ type: String }],
    supported64BitAbis: [{ type: String }],
    supportedAbis: [{ type: String }],
    syncUniqueId: { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    deletedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
deviceSchema.plugin(toJSON);
deviceSchema.plugin(paginate);

/**
 * @typedef Device
 */
const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
