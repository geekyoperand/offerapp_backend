const httpStatus = require('http-status');
const mongoose = require('mongoose');
const https = require('https');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  orderService,
  cartService,
  configurationService,
  couponService,
  couponappliedhistoryService,
  userService,
  transactionService,
  itemQuantityTrackerService,
  placeService,
} = require('../services');
const { calculateCouponDiscountAndPaidAmount, validateCoupon, calculateDiscount } = require('../utils/coupon');
const { paymentStatus, orderStatus } = require('../constants');
const { error, success } = require('../utils/responseApi');
const { paytm } = require('../config/config');
const PaytmChecksum = require('../utils/paytmChecksum');
const { getWeekDay } = require('../utils/common');

const calculateTaxAndCharges = async ({ items, itemQuantity }) => {
  let tax = 0;
  items.forEach((ele) => {
    tax += (ele.tax + ele.extraCharges) * itemQuantity[ele._id.toString()].quantity;
  });
  return tax;
};
const placeOrder = catchAsync(async (req, res) => {
  const cart = await cartService.getCart({ userId: mongoose.Types.ObjectId(req.user.id) }, [
    'placeId',
    'couponId',
    'items.itemId',
  ]);
  // const { placeId, quantity } = req.body;

  if (!cart) {
    return res.status(httpStatus.BAD_REQUEST).send(error('CRT003', {}, httpStatus.BAD_REQUEST));
  }

  if (!(cart && cart.placeId && cart.placeId._id)) {
    return res.status(httpStatus.BAD_REQUEST).send(error('ORDR001', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Selected place not found');
  }

  const { date, placeId, slotId, couponId } = cart;
  const { specificOffDays, closedDays } = placeId;
  if (
    specificOffDays.find((ele) => new Date(ele).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)) ||
    closedDays.find((ele) => ele === new Date(date).getDay() + 1)
  ) {
    return res.status(httpStatus.BAD_REQUEST).send(error('ORDR001', {}, httpStatus.BAD_REQUEST));
  }

  let { items } = cart;
  if (!items || items.find((item) => item.itemId.placeId.toString() !== placeId._id.toString())) {
    return res.status(httpStatus.BAD_REQUEST).send(error('ORDR001', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Invalid items selected');
  }

  let totalAmountWithoutDiscount = 0;
  let totalAmount = 0;

  const itemQuantity = {};
  const itemIds = [];
  items = items.map((item) => {
    itemQuantity[item.itemId._id.toString()] = { quantity: item.quantity };
    return item.itemId;
  });

  const itemWithQntities = items.filter((item) => {
    itemIds.push(mongoose.Types.ObjectId(item._id));
    const { specialDays, isQuantityDependent, initialQuantity } = item;
    const specialDay = specialDays.find((ele) => new Date(ele.date) === new Date(date));
    if (specialDay && !specialDay.isQuantityDependent) {
      totalAmountWithoutDiscount += itemQuantity[item._id.toString()].quantity * item.originalPrice;
      totalAmount += itemQuantity[item._id.toString()].quantity * item.currentPrice;
      itemQuantity[item._id.toString()] = { ...itemQuantity[item._id.toString()], isQuantityDependent: false };
      return false;
    }
    if (!specialDay && !isQuantityDependent) {
      totalAmountWithoutDiscount += itemQuantity[item._id.toString()].quantity * item.originalPrice;
      totalAmount += itemQuantity[item._id.toString()].quantity * item.currentPrice;
      itemQuantity[item._id.toString()] = { ...itemQuantity[item._id.toString()], isQuantityDependent: false };
      return false;
    }
    totalAmountWithoutDiscount += itemQuantity[item._id.toString()].quantity * item.originalPrice;
    totalAmount += itemQuantity[item._id.toString()].quantity * item.currentPrice;
    itemQuantity[item._id.toString()] = {
      ...itemQuantity[item._id.toString()],
      id: item._id,
      isQuantityDependent: true,
      remainingQuantity: specialDay ? specialDay.initialQuantity : initialQuantity,
    };
    return true;
  });

  const tax = await calculateTaxAndCharges({
    items,
    itemQuantity,
  });

  totalAmountWithoutDiscount += tax;
  totalAmount += tax;

  let amountToBePaid = totalAmount;

  // coupon initialization
  let couponDiscount = 0;
  let couponInvalidMessage = null;
  if (cart.couponId) {
    const coupon = cart.couponId;
    couponInvalidMessage = await validateCoupon({
      coupon,
      placeId: cart.placeId._id,
      itemQuantity,
      items,
      slotId: cart.slotId.toString(),
      userId: req.user.id,
    });
    if (!couponInvalidMessage) {
      couponDiscount = calculateDiscount({
        coupon,
        amountToBePaid,
      });
    }
    amountToBePaid -= couponDiscount;
  }
  let pointsDiscount = 0;
  // points
  const { user } = req;
  if (cart.pointsDiscount > 0) {
    const pointsConfig = await configurationService.getConfiguration({ code: 'MAX_POINTS_USE_PER_ORDER' });
    pointsDiscount = cart.pointsDiscount > pointsConfig.value ? pointsConfig.value : cart.pointsDiscount;
    amountToBePaid -= pointsDiscount;
  }

  const itemQntyTrckrers = await itemQuantityTrackerService.getItemQuantityTrackers({
    date: new Date(new Date(date).setHours(0, 0, 0, 0)),
    slotId,
    itemId: { $in: itemWithQntities.map((item) => mongoose.Types.ObjectId(item._id)) },
    placeId: cart.placeId.id,
  });

  const errors = [];

  itemQntyTrckrers.forEach((itmqntytrckr) => {
    itemQuantity[itmqntytrckr.itemId] = {
      ...itemQuantity[itmqntytrckr.itemId],
      remainingQuantity: itmqntytrckr.remainingQuantity,
    };
    if (itemQuantity[itmqntytrckr.itemId].quantity > itemQuantity[itmqntytrckr.itemId].remainingQuantity) {
      errors.push({
        remainingQty: itemQuantity[itmqntytrckr.itemId].remainingQuantity,
        itemId: itmqntytrckr.itemId,
        type: "quantity",
        isFinished: itemQuantity[itmqntytrckr.itemId].remainingQuantity === 0,
      });
    }
  });
  const isPlaceInactive = placeId.isTemporarilyClosed || !placeId.isPublished || placeId.isDeleted;
  const weekDay = getWeekDay(cart.date);
  const isPlaceInactiveForCurrentDate =
    placeId.closedDays.find((day) => weekDay === day) ||
    placeId.specificOffDays.find(
      (specificOffDay) => new Date(specificOffDay).setHours(0, 0, 0, 0) === new Date(cart.date).setHours(0, 0, 0, 0)
    );
  const selectedSlot = placeId.slots.find((slot) => slot._id.toString() === cart.slotId.toString());
  const isSlotInactive = !(
    new Date(selectedSlot.activeFrom).setHours(0, 0, 0, 0) < new Date(cart.date) &&
    (!selectedSlot.activeTill || new Date(selectedSlot.activeTill).setHours(0, 0, 0, 0) >= new Date(cart.date)) &&
    !selectedSlot.inactiveOn.find(
      (inactiveOn) => new Date(inactiveOn).setHours(0, 0, 0, 0) === new Date(cart.date).setHours(0, 0, 0, 0)
    )
  );
  const hasPlaceSpecificError =
    isPlaceInactive || isSlotInactive || isPlaceInactiveForCurrentDate || (errors && errors.length > 0);
  if (
    !!couponInvalidMessage ||
    couponDiscount !== cart.couponDiscount ||
    amountToBePaid !== cart.amountToBePaid ||
    pointsDiscount !== cart.pointsDiscount ||
    totalAmount !== cart.totalAmount ||
    totalAmountWithoutDiscount !== cart.totalAmountWithoutDiscount ||
    tax !== cart.tax ||
    hasPlaceSpecificError
  ) {
    await cartService.updateCartById(user.cartId, {
      totalAmount,
      couponDiscount,
      totalAmountWithoutDiscount,
      pointsDiscount,
      tax,
      amountToBePaid,
      updatedBy: req.user.id,
      updatedOn: new Date(),
    });
    return res.status(httpStatus.BAD_REQUEST).send(
      error(
        'ORDR004',
        {
          cart: {
            couponDiscount,
            amountToBePaid,
            pointsDiscount,
            totalAmount,
            totalAmountWithoutDiscount,
            tax,
            couponInvalidMessage,
          },
          isPlaceInactive,
          isSlotInactive,
          isPlaceInactiveForCurrentDate,
          errors,
        },
        httpStatus.BAD_REQUEST
      )
    );
  }

  const paytmParams = {};

  const orderId = new Date().getTime().toString();
  paytmParams.body = {
    requestType: 'Payment',
    mid: paytm.MID,
    orderId,
    callbackUrl: `${paytm.CALLBACK_URL}${orderId}`,
    websiteName: `WEBSTAGING`,
    txnAmount: {
      value: amountToBePaid.toFixed(2).toString(),
      currency: 'INR',
    },
    userInfo: {
      custId: user.id,
    },
  };
  const checksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), paytm.KEY);
  paytmParams.head = {
    signature: checksum,
  };

  const postData = JSON.stringify(paytmParams);
  const options = {
    /* for Staging */
    hostname: 'securegw-stage.paytm.in',

    /* for Production */
    // hostname: 'securegw.paytm.in',

    port: 443,
    path: `/theia/api/v1/initiateTransaction?mid=${paytm.MID}&orderId=${orderId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  let response = '';
  const postReq = https.request(options, function (postRes) {
    postRes.on('data', function (chunk) {
      response += chunk;
    });

    postRes.on('end', async () => {
      console.log('Response: ', response);

      const order = await orderService.createOrder({
        placeId: placeId._id,
        userId: req.user.id,
        couponId: couponId && couponId._id ? couponId._id : null,
        slotId,
        date,
        totalAmount,
        couponDiscount,
        pointsDiscount,
        totalAmountWithoutDiscount,
        tax,
        shortId: orderId,
        amountToBePaid,
        status: orderStatus.PAYMENT_PENDING,
        // couponId: couponData.isNotApplicable ? null : coupon.couponId._id,
        createdBy: req.user.id,
        // unapplicableReason: couponData.unapplicableReason,
        items: cart.items.map((item) => {
          return {
            itemId: item.itemId._id,
            originalPrice: item.itemId.originalPrice,
            currentPrice: item.itemId.currentPrice,
            discountedPrice: item.itemId.currentPrice,
            quantity: item.quantity,
          };
        }),
      });

      for (const item of itemWithQntities) {
        itemQuantityTrackerService.updateItemQuantityTracker(
          {
            date: new Date(new Date(date).setHours(0, 0, 0, 0)),
            slotId,
            itemId: mongoose.Types.ObjectId(item._id),
            placeId: cart.placeId.id,
          },
          {
            $inc: { remainingQuantity: -1 * itemQuantity[item._id.toString()].quantity },
          }
        );
      }
      if (cart.couponId && cart.couponId._id) {
        couponService.updateCouponById(cart.couponId._id, {
          $inc: { count: -1 },
        });

        couponappliedhistoryService.createCouponAppliedHistory({
          userId: req.user.id,
          orderId: order._id,
          couponId: cart.couponId._id,
        });
      }
      if (pointsDiscount) userService.updateUserById(req.user.id, { $inc: { points: -1 * pointsDiscount } });

      // const transaction = await transactionService.createTransaction({
      //   userId: req.user.id,
      //   orderId: order._id,
      //   // paymentMode,
      //   amount: amountToBePaid,
      //   status: paymentStatus.PENDING,
      //   createdBy: req.user.id,
      // });
      // order = await orderService.updateOrderById(order._id, {
      //   transactionId: transaction._id,
      // });

      // await cartService.emptyCart(cart._id);
      return res.status(httpStatus.OK).send(success('ORDR002', { order, txnToken: response, orderId }, httpStatus.OK));
    });
  });
  postReq.write(postData);
  postReq.end();

  // return res.status(httpStatus.CREATED).send({ message: 'order and transaction created successfully ', transaction });
});

// payment gateway
// if (!user.stripeid) {
//   const customer = await stripe.customers.create({
//     description: 'My First Test Customer (created for API docs)',
//   });

//   userService.updateUserById(user._id, {
//     stripeid: customer.id,
//   });
// }

const postOrderRating = catchAsync(async (req, res) => {
  const { rating, orderId } = req.body;
  const order = await orderService.getOrder({
    _id: mongoose.Types.ObjectId(req.body.orderId),
    userId: mongoose.Types.ObjectId(req.user.id),
  });
  if (!order) {
    return res.status(httpStatus.BAD_REQUEST).send(error('ORDR004', {}, httpStatus.BAD_REQUEST));
  }
  if (order.isRated) {
    return res.status(httpStatus.BAD_REQUEST).send(error('ORDR008', {}, httpStatus.BAD_REQUEST));
  }
  await orderService.updateOrderById(orderId, {
    isRated: true,
    rating,
    orderId,
  });
  const ratingCount = await orderService.getOrdersCount({ placeId: order.placeId, rating: { $ne: undefined } });

  if (ratingCount >= 10) {
    const data = await orderService.aggregateOrder([
      { $match: { placeId: order.placeId } },
      { $group: { _id: null, rating: { $sum: '$rating' } } },
    ]);
    let totalRating = 0;
    if (data.length > 0) {
      totalRating = data[0].rating;
    }
    totalRating /= ratingCount;
    await placeService.updatePlaceById(order.placeId, {
      rating: totalRating,
    });
  }
  return res.status(httpStatus.OK).send(success('ORDR009', {}, httpStatus.OK));
});

const getOrders = catchAsync(async (req, res) => {
  // let filter = {
  //   ...pick(req.query, ['placeId', 'status', 'userId', 'couponId']),
  //   userId: mongoose.Types.ObjectId(req.user.id),
  // };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // options.populate = [
  //   { keys: 'placeId', select: 'name locatedArea logo slots._id slots.startTime slots.endTime' },
  //   { keys: 'transactionId', select: 'status' },
  //   { keys: 'items.itemId', select: 'name' },
  // ];
  // options.select = 'amountToBePaid date items.itemId items.quantity quantity status shortId slotId isRated';

  const filter = [
    {
      $match: {
        ...pick(req.query, ['placeId', 'status', 'couponId']),
        userId: mongoose.Types.ObjectId(req.user.id),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: 'transactions',
        localField: 'transactionId',
        foreignField: '_id',
        as: 'transactionId',
      },
    },
    {
      $unwind: {
        path: '$transactionId',
      },
    },
    {
      $match: {
        'transactionId.responseCode': {
          $in: ['01', '227', '400', '401', '402', '810'],
        },
      },
    },
    {
      $lookup: {
        from: 'places',
        localField: 'placeId',
        foreignField: '_id',
        as: 'placeId',
      },
    },
    {
      $unwind: {
        path: '$placeId',
      },
    },
    {
      $unwind: {
        path: '$items',
      },
    },
    {
      $lookup: {
        from: 'items',
        localField: 'items.itemId',
        foreignField: '_id',
        as: 'items.itemId',
      },
    },
    {
      $unwind: {
        path: '$items.itemId',
      },
    },
    {
      $group: {
        _id: '$_id',
        items: {
          $push: '$items',
        },
        amountToBePaid: { $first: '$amountToBePaid' },
        date: { $first: '$date' },
        quantity: { $first: '$quantity' },
        status: { $first: '$status' },
        shortId: { $first: '$shortId' },
        slotId: { $first: '$slotId' },
        isRated: { $first: '$isRated' },
        placeId: { $first: '$placeId' },
      },
    },
    {
      $project: {
        _id: 1,
        amountToBePaid: 1,
        date: 1,
        'items.itemId.name': 1,
        'items.quantity': 1,
        quantity: 1,
        status: 1,
        shortId: 1,
        slotId: 1,
        isRated: 1,
        'placeId._id': 1,
        'placeId.name': 1,
        'placeId.locatedArea': 1,
        'placeId.logo': 1,
        'placeId.slots._id': 1,
        'placeId.slots.startTime': 1,
        'placeId.slots.endTime': 1,
      },
    },
  ];
  const orders = await orderService.queryOrders(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('ORDR003', { orders }, httpStatus.PARTIAL_CONTENT));
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(
    { _id: mongoose.Types.ObjectId(req.params.orderId), userId: mongoose.Types.ObjectId(req.user.id) },
    '',
    ['placeId', 'transactionId', 'items.itemId', 'couponId']
  );
  if (!order) {
    return res.status(httpStatus.BAD_REQUEST).send(error('ORDR004', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return res.status(httpStatus.OK).send(success('ORDR005', { order }, httpStatus.OK));
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('ORDR006', { order }, httpStatus.OK));
});

const deleteOrder = catchAsync(async (req, res) => {
  await orderService.deleteOrderById(req.params.orderId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENt).send(success('ORDR007', {}, httpStatus.NO_CONTENt));
});

module.exports = {
  placeOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  postOrderRating,
};
