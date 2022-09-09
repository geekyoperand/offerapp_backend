const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  couponService,
  cartService,
  itemQuantityTrackerService,
  orderService,
  configurationService,
} = require('../services');
const { validateCoupon, calculateDiscount } = require('../utils/coupon');
const { success, error } = require('../utils/responseApi');
const { getWeekDay } = require('../utils/common');

const calculateTaxAndCharges = async ({ items, itemQuantity }) => {
  let tax = 0;
  items.forEach((ele) => {
    tax += (ele.tax + ele.extraCharges) * itemQuantity[ele._id.toString()].quantity;
  });
  return tax;
};

const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon({
    ...req.body,
    createdBy: req.user.id,
    initialCount: req.body.count,
    code: req.body.code.toUpperCase(),
  });
  return res.status(httpStatus.CREATED).send(success('CPN001', { coupon }, httpStatus.CREATED));
});

const getCoupons = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'name',
    'description',
    'quantityType',
    'isUsageLimit',
    'activeFrom',
    'activeTill',
    'isActive',
    'isForFirstOrder',
    'type',
  ]);

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  // options.paginate = 'placeIds';
  options.select =
    'places inactiveOn count code quantityType isUsageLimit discountAmount maxDiscount minTickets activeFrom activeTill isActive isForFirstOrder maxTimes discountPercentage type name description termsAndConditions minCartValue';
  const coupons = await couponService.queryCoupons(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('CPN002', { coupons }, httpStatus.PARTIAL_CONTENT));
});

// const  = async ({ totalAmount, items, totalAmountWithoutDiscount }) => {
//   let tax = 0;
//   items.forEach((ele) => {
//     tax += ele.tax + ele.extraCharges;
//   });
//   return {
//     updatedTotalAmount: totalAmount + tax,
//     updatedTotalAmountWithoutDiscount: totalAmountWithoutDiscount + tax,
//     tax,calculateTaxAndCharges
//   };
// };

const applyCoupon = catchAsync(async (req, res) => {
  const couponCode = req.body.code;
  const cart = await cartService.getCart({ userId: mongoose.Types.ObjectId(req.user.id) }, ['items.itemId', 'placeId']);
  if (!cart) {
    return res.status(httpStatus.OK).send(success('CPN003', { cart }, httpStatus.OK));
  }
  if (!(cart && cart.placeId && cart.items && cart.items.length > 0 && cart.slotId && cart.date)) {
    return res.status(httpStatus.BAD_REQUEST).send(error('CPN004', {}, httpStatus.BAD_REQUEST));
  }

  let { items } = cart;
  const { date, slotId, placeId } = cart;

  const itemQuantity = {};
  items = items.map((item) => {
    itemQuantity[item.itemId._id.toString()] = { quantity: item.quantity };
    return item.itemId;
  });
  let totalAmountWithoutDiscount = 0;
  let totalAmount = 0;
  const itemWithQntities = items.filter((item) => {
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
      isQuantityDependent: true,
      remainingQuantity: specialDay ? specialDay.initialQuantity : initialQuantity,
    };
    return true;
  });

  const itemQntyTrckrers = await itemQuantityTrackerService.getItemQuantityTrackers({
    date: new Date(new Date(date).setHours(0, 0, 0, 0)),
    slotId: mongoose.Types.ObjectId(slotId),
    itemId: { $in: itemWithQntities.map((item) => mongoose.Types.ObjectId(item._id)) },
    placeId: mongoose.Types.ObjectId(placeId._id),
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

  const tax = await calculateTaxAndCharges({
    items,
    itemQuantity,
  });

  let amountToBePaid = totalAmount + tax;
  const coupon = await couponService.getCoupon({ code: { $regex: new RegExp(`^${couponCode}$`), $options: 'i' } });

  let couponDiscount = 0;

  const couponInvalidMessage = await validateCoupon({
    coupon,
    placeId: placeId._id,
    itemQuantity,
    items,
    slotId,
    userId: req.user.id,
  });
  if (!couponInvalidMessage) {
    couponDiscount = calculateDiscount({
      coupon,
      amountToBePaid,
    });
  }

  amountToBePaid -= couponDiscount;

  let pointsDiscount = 0;
  // points
  if (cart.pointsDiscount > 0) {
    const { user } = req;
    const pointsConfig = await configurationService.getConfiguration({ code: 'MAX_POINTS_USE_PER_ORDER' });
    pointsDiscount = cart.pointsDiscount > pointsConfig.value ? pointsConfig.value : cart.pointsDiscount;
    amountToBePaid -= pointsDiscount;
    amountToBePaid -= cart.pointsDiscount;
  }

  const data = {
    couponDiscount,
    amountToBePaid,
    pointsDiscount,
    totalAmountWithoutDiscount,
    tax,
    couponId: couponInvalidMessage ? null : coupon._id,
    updatedBy: req.user.id,
    updatedOn: new Date(),
    couponInvalidMessage,
  };
  await cartService.updateCartById(cart._id, data);
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

  if (hasPlaceSpecificError) {
    return res.status(httpStatus.BAD_REQUEST).send(
      error(
        'CRT006',
        {
          isPlaceInactive,
          isSlotInactive,
          isPlaceInactiveForCurrentDate,
          errors,
          cart: data,
        },
        httpStatus.BAD_REQUEST
      )
    );
  }
  return res.status(httpStatus.OK).send(
    success(
      'CRT006',
      {
        cart: { ...data, couponId: coupon },
      },
      httpStatus.OK
    )
  );
});

const removeCoupon = catchAsync(async (req, res) => {
  const cart = await cartService.getCart({ userId: mongoose.Types.ObjectId(req.user.id) }, ['items.itemId', 'placeId']);
  if (!cart) {
    return res.status(httpStatus.OK).send(success('CPN003', { cart }, httpStatus.OK));
  }
  if (!(cart && cart.placeId && cart.items && cart.items.length > 0 && cart.slotId && cart.date)) {
    return res.status(httpStatus.BAD_REQUEST).send(error('CPN004', {}, httpStatus.BAD_REQUEST));
  }

  let { items } = cart;
  const { date, slotId, placeId } = cart;

  const itemQuantity = {};
  items = items.map((item) => {
    itemQuantity[item.itemId._id.toString()] = { quantity: item.quantity };
    return item.itemId;
  });
  let totalAmountWithoutDiscount = 0;
  let totalAmount = 0;
  const itemWithQntities = items.filter((item) => {
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
      isQuantityDependent: true,
      remainingQuantity: specialDay ? specialDay.initialQuantity : initialQuantity,
    };
    return true;
  });

  const itemQntyTrckrers = await itemQuantityTrackerService.getItemQuantityTrackers({
    date: new Date(new Date(date).setHours(0, 0, 0, 0)),
    slotId: mongoose.Types.ObjectId(slotId),
    itemId: { $in: itemWithQntities.map((item) => mongoose.Types.ObjectId(item._id)) },
    placeId: mongoose.Types.ObjectId(placeId._id),
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

  const tax = await calculateTaxAndCharges({
    items,
    itemQuantity,
  });

  let amountToBePaid = totalAmount + tax;
  const couponDiscount = 0;

  let pointsDiscount = 0;
  // points
  if (cart.pointsDiscount > 0) {
    const { user } = req;
    const pointsConfig = await configurationService.getConfiguration({ code: 'MAX_POINTS_USE_PER_ORDER' });
    pointsDiscount = cart.pointsDiscount > pointsConfig.value ? pointsConfig.value : cart.pointsDiscount;
    amountToBePaid -= pointsDiscount;
    amountToBePaid -= cart.pointsDiscount;
  }

  const data = {
    couponDiscount,
    amountToBePaid,
    pointsDiscount,
    totalAmountWithoutDiscount,
    tax,
    couponId: null,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  };
  await cartService.updateCartById(cart._id, data);

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
  if (hasPlaceSpecificError) {
    return res.status(httpStatus.BAD_REQUEST).send(
      error(
        'CRT006',
        {
          isPlaceInactive,
          isSlotInactive,
          isPlaceInactiveForCurrentDate,
          errors,
          cart: data,
        },
        httpStatus.BAD_REQUEST
      )
    );
  }
  return res.status(httpStatus.OK).send(
    success(
      'CRT006',
      {
        cart: data,
      },
      httpStatus.OK
    )
  );
});

const getActiveCoupons = catchAsync(async (req, res) => {
  const keys =
    'placeIds  count  code  quantityType  isUsageLimit  discountAmount  minTickets  couponItemKeywords  discountPercentage  type  name  description  termsAndConditions  minCartValue';
  // const isForFirstOrder =

  const filter = {
    ...req.query,
    isActive: true,
    activeFrom: {
      $lt: new Date(),
    },
    $or: [
      {
        activeTill: null,
      },
      {
        activeTill: { $gte: new Date() },
      },
    ],
  };
  const count = await orderService.getOrdersCount({ userId: req.user.id });
  if (count) {
    filter.isForFirstOrder = { $ne: true };
  }
  const coupons = await couponService.getCoupons(filter, keys);
  return res.status(httpStatus.OK).send(success('CPN013', { coupons }, httpStatus.OK));
});

const getCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.couponId, ['placeIds']);
  if (!coupon) {
    return res.status(httpStatus.BAD_REQUEST).send(error('CPN014', {}, httpStatus.BAD_REQUEST));
    // throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  }
  return res.status(httpStatus.OK).send(success('CPN015', { coupon }, httpStatus.OK));
});

const updateCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.updateCouponById(req.params.couponId, {
    ...req.body,
    initialCount: req.body.count,
    updatedBy: req.user.id,
  });
  return res.status(httpStatus.OK).send(success('CPN016', { coupon }, httpStatus.OK));
});

const deleteCoupon = catchAsync(async (req, res) => {
  await couponService.deleteCouponById(req.params.couponId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('CPN017', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createCoupon,
  getCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  removeCoupon,
  getActiveCoupons,
};
