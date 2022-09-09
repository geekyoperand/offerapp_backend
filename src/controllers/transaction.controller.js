const httpStatus = require('http-status');
const https = require('https');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  transactionService,
  orderService,
  itemQuantityTrackerService,
  couponappliedhistoryService,
  couponService,
  userService,
  pointHistoryService,
  notificationService,
  cartService,
} = require('../services');
const { success, error } = require('../utils/responseApi');
const { paytm } = require('../config/config');
const PaytmChecksum = require('../utils/paytmChecksum');
const { transactionStatuses } = require('../constants/transaction');
const { pointEarningTypes } = require('../constants/points');
const { notificationTypes, notificationTexts } = require('../constants/notification');
const { orderStatus } = require('../constants/order');

const createTransaction = catchAsync(async (req, res) => {
  // const transaction = await transactionService.createTransaction({
  //   ...req.body,
  //   userId: req.user.id,
  //   createdBy: req.user.id,
  // });

  const { user } = req;

  const orderId = new Date().getTime().toString();
  paytmParams.body = {
    requestType: 'Payment',
    mid: paytm.MID,
    orderId,
    callbackUrl: `${paytm.CALLBACK_URL}${orderId}`,
    txnAmount: {
      value: '101.00',
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

    postRes.on('end', function () {
      console.log('Response: ', response);
      return res.status(httpStatus.CREATED).send(success('TRNSCTN001', { txnToken: response, orderId }, httpStatus.CREATED));
    });
  });

  postReq.write(postData);
  postReq.end();
});

const transactionStatus = catchAsync(async (req, res) => {
  console.log(req.body);
  const {
    CURRENCY,
    GATEWAYNAME,
    RESPMSG,
    BANKNAME,
    PAYMENTMODE,
    CUSTID,
    MID,
    MERC_UNQ_REF,
    RESPCODE,
    TXNID,
    TXNAMOUNT,
    ORDERID,
    STATUS,
    BANKTXNID,
    TXNDATETIME,
    TXNDATE,
    CHECKSUMHASH,
  } = req.body;
  if (MID !== paytm.MID) {
    console.log('-----differentMIDS -------', MID);
    return res.status(httpStatus.BAD_REQUEST).send(error('TRNSCTN001', {}, httpStatus.BAD_REQUEST));
  }

  const body = { mid: paytm.MID, orderId: ORDERID };

  const isVerified = PaytmChecksum.verifySignature(JSON.stringify(body), paytm.KEY, CHECKSUMHASH);
  // if (isVerified) {
  const order = await orderService.getOrder(
    { shortId: ORDERID },
    '_id amountToBePaid couponId pointsDiscount userId placeId items slotId date',
    'userId'
  );

  const { items, userId, pointsDiscount, placeId, couponId, slotId, date, amountToBePaid } = order;

  if (amountToBePaid != parseFloat(TXNAMOUNT)) {
    console.log('-----log here checkpoint 1---------');
  }
  const transaction = await transactionService.createTransaction({
    currency: CURRENCY,
    gatewayName: GATEWAYNAME,
    responseMessage: RESPMSG,
    bankName: BANKNAME,
    paymentMode: PAYMENTMODE,
    userId: CUSTID,
    responseCode: RESPCODE,
    transactionId: TXNID,
    amount: parseFloat(TXNAMOUNT),
    shortOrderId: ORDERID,
    orderId: order._id,
    status: STATUS,
    bankTransactionId: BANKTXNID,
    transactionDateTime: TXNDATETIME,
    transactionDate: TXNDATE,
  });

  const status = STATUS;
  const responseCode = RESPCODE;

  if (status === transactionStatuses.TXN_SUCCESS) {
    await orderService.updateOrderById(order._id, {
      status: orderStatus.SUCCESS,
      transactionId: transaction._id,
    });
    await cartService.emptyCart(userId.cartId);
    if (pointsDiscount) {
      pointHistoryService.createPointHistory({
        userId: userId._id,
        orderId: order._id,
        points: pointsDiscount,
        placeId,
      });
    }
    notificationService.createNotification({
      userId: userId._id,
      type: notificationTypes.USER_SPECIFIC,
      text: notificationTexts.PLACE_BOOKING,
      points: pointsDiscount,
      orderId: order._id,
      placeId,
    });
  } else if (status === transactionStatuses.TXN_FAILURE || status === transactionStatuses.NO_RECORD_FOUND) {
    console.log('----date----', date, items, order._id);
    await orderService.updateOrderById(order._id, {
      status: orderStatus.PAYMENT_FAILED,
      transactionId: transaction._id,
    });
    for (const item of items) {
      await itemQuantityTrackerService.updateItemQuantityTracker(
        {
          date: new Date(new Date(date).setHours(0, 0, 0, 0)),
          slotId: mongoose.Types.ObjectId(slotId),
          itemId: mongoose.Types.ObjectId(item.itemId),
          placeId: mongoose.Types.ObjectId(placeId),
        },
        {
          $inc: { remainingQuantity: item.quantity },
        }
      );
    }
    if (couponId) {
      couponappliedhistoryService.updateCouponAppliedHistory(
        {
          orderId: order._id,
          userId: userId._id,
          couponId,
        },
        { isDeleted: true }
      );
      couponService.updateCouponById(couponId, {
        $inc: { count: 1 },
      });
    }

    if (pointsDiscount) {
      userService.updateUserById(userId._id, {
        $inc: { points: pointsDiscount },
      });
    }
  } else if (status === transactionStatuses.PENDING) {
    await orderService.updateOrderById(order._id, {
      status: orderStatus.PAYMENT_PENDING,
      transactionId: transaction._id,
    });
  } else {
    console.log('-----log here checkpoint 2---------');
    // log here
  }
  return res.status(httpStatus.OK).send(success('TRNSCTN001', req.body, httpStatus.OK));
  // }
  // console.log('----checksum not matched');
  // return res.status(httpStatus.BAD_REQUEST).send(error('TRNSCTN001', {}, httpStatus.BAD_REQUEST));
});

const getTransactions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['userId', 'orderId', 'paymentMode', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'orderId userId';
  const transactions = await transactionService.queryTransactions(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('TRNSCTN002', { transactions }, httpStatus.PARTIAL_CONTENT));
});

const getTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.transactionId, ['userId', 'orderId']);
  if (!transaction) {
    return res.status(httpStatus.BAD_REQUEST).send(error('TRNSCTN003', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  return res.status(httpStatus.OK).send(success('TRNSCTN004', { transaction }, httpStatus.OK));
});

const updateTransaction = catchAsync(async (req, res) => {
  const transaction = await transactionService.updateTransactionById(req.params.transactionId, {
    ...req.body,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  return res.status(httpStatus.OK).send(success('TRNSCTN005', { transaction }, httpStatus.OK));
});

const deleteTransaction = catchAsync(async (req, res) => {
  await transactionService.deleteTransactionById(req.params.transactionId, {
    deletedBy: req.user.id,
    deletedOn: new Date(),
  });
  return res.status(httpStatus.NO_CONTENT).send(success('TRNSCTN006', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createTransaction,
  transactionStatus,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
