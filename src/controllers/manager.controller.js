const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { placeService } = require('../services');
const { success } = require('../utils/responseApi');

const getPlace = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const place = await placeService.getPlace(
    {
      createdBy: mongoose.Types.ObjectId(userId),
    },
    [],
    'name locatedArea address keywords closedDays specificOffDays images logo type slots._id slots.name slots.isDeleted slots.startTime slots.endTime slots.placeDescription slots.activeFrom slots.activeTill slots.complementaries slots.inactiveOn tags shortTagline isPublished'
  );
  const slots = place.slots.filter((slot) => !slot.isDeleted);
  return res.status(httpStatus.OK).send(success('PLC004', { place: { ...place, slots } }, httpStatus.OK));
});

module.exports = {
  getPlace,
};
