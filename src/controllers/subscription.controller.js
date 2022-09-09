const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { subscriptionService } = require('../services');
const { success } = require('../utils/responseApi');

const createSubscription = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.createSubscription({ ...req.body });
  return res.status(httpStatus.CREATED).send({
    message: 'Subscription created successfully',
    success: true,
    code: httpStatus.CREATED,
    data: { subscription },
  });
});

module.exports = {
  createSubscription,
};
