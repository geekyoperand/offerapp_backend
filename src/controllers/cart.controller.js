const httpStatus = require('http-status');
const mongoose = require('mongoose');
const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  cartService,
  configurationService,
  couponappliedhistoryService,
  itemService,
  itemQuantityTrackerService,
  couponService,
  userService,
  placeService,
} = require('../services');
const { calculateCouponDiscountAndPaidAmount, validateCoupon, calculateDiscount } = require('../utils/coupon');
const { success, error } = require('../utils/responseApi');
const { getWeekDay } = require('../utils/common');

const createCart = catchAsync(async (req, res) => {
  const cartCount = cartService.getCartsCount({ userId: req.user.id });
  if (cartCount) return res.status(httpStatus.BAD_REQUEST).send(error('CRT001', {}, httpStatus.BAD_REQUEST)); // REWORK - Cart already exists
  const cart = await cartService.createCart({ ...req.body, userId: req.user.id, createdBy: req.user.id });
  return res.status(httpStatus.CREATED).send(success('CRT001', { cart }, httpStatus.CREATED));
});

const getCarts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['placeId', 'userId', 'couponId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'placeId couponId userId items.itemId';
  const carts = await cartService.queryCarts(filter, options);
  return res.status(httpStatus.PARTIAL_CONTENT).send(success('CRT002', { carts }, httpStatus.PARTIAL_CONTENT));
});

const calculateTaxAndCharges = async ({ items, itemQuantity }) => {
  let tax = 0;
  items.forEach((ele) => {
    tax += (ele.tax + ele.extraCharges) * itemQuantity[ele._id.toString()].quantity;
  });
  return tax;
};

const getMyCart = catchAsync(async (req, res) => {
  // get card by user id
  const cart = await cartService.getCart({ userId: mongoose.Types.ObjectId(req.user.id) }, [
    'placeId',
    'couponId',
    'items.itemId',
  ]);
  // calcuate total amount of item
  if (!cart.items.length) return res.status(httpStatus.OK).send(success('CRT004', { cart }, httpStatus.OK));

  let totalAmountWithoutDiscount = 0;
  let totalAmount = 0;

  let { items } = cart;
  let { date } = cart;
  if (new Date(date) < new Date()) {
    date = new Date().toString();
  }
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
      isQuantityDependent: true,
      remainingQuantity: specialDay ? specialDay.initialQuantity : initialQuantity,
    };
    return true;
  });

  const itemQntyTrckrers = await itemQuantityTrackerService.getItemQuantityTrackers({
    date: new Date(new Date(date).setHours(0, 0, 0, 0)),
    slotId: cart.slotId,
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
        type: 'quantity',
        isFinished: itemQuantity[itmqntytrckr.itemId].remainingQuantity === 0,
      });
    }
  });

  // placeId = placeId.toString();

  // calculate tax
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

  const data = {
    placeId: cart.placeId,
    slotId: cart.slotId,
    date: cart.date,
    couponDiscount,
    amountToBePaid,
    pointsDiscount,
    totalAmount,
    totalAmountWithoutDiscount,
    tax,
    couponId: cart.couponId,
    updatedBy: req.user.id,
    updatedOn: new Date(),
    couponInvalidMessage,
    items: cart.items,
  };
  await cartService.updateCartById(user.cartId, {
    date,
    totalAmount,
    couponDiscount,
    totalAmountWithoutDiscount,
    pointsDiscount,
    tax,
    amountToBePaid,
    updatedBy: req.user.id,
    updatedOn: new Date(),
  });
  const isPlaceInactive = cart.placeId.isTemporarilyClosed || !cart.placeId.isPublished || cart.placeId.isDeleted;
  const weekDay = getWeekDay(cart.date);
  const isPlaceInactiveForCurrentDate =
    cart.placeId.closedDays.find((day) => weekDay === day) ||
    cart.placeId.specificOffDays.find(
      (specificOffDay) => new Date(specificOffDay).setHours(0, 0, 0, 0) === new Date(cart.date).setHours(0, 0, 0, 0)
    );
  const selectedSlot = cart.placeId.slots.find((slot) => slot._id.toString() === cart.slotId.toString());
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

  // end: update cart
});

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartById(req.params.cartId, ['placeId', 'items.itemId', 'couponId']);
  if (!cart) {
    // throw new ApiError(httpStatus.NOT_FOUND, 'Cart not found');
    return res.status(httpStatus.BAD_REQUEST).send(error('CRT003', {}, httpStatus.BAD_REQUEST));
  }
  return res.status(httpStatus.OK).send(success('CRT005', { cart }, httpStatus.OK));
});

// const getRemainingItemQuantity = async ({ date, item }) => {
//   return new Promise(async (resolve) => {
//     const { specialDays, isQuantityDependent, initialQuantity } = item;
//     const specialDay = specialDays.find((ele) => new Date(ele.date) === new Date(date));
//     if (specialDay && !specialDay.isQuantityDependent) {
//       resolve({ isQuantityDependent: false });
//     }
//     if (!specialDay && !isQuantityDependent) {
//       resolve({ isQuantityDependent: false });
//     }
//     const itemQntyTrckr = await itemQuantityTrackerService.getItem({
//       date: new Date(date),
//       itemId: item._id,
//     });
//     if (!itemQntyTrckr) {
//       if (specialDay) {
//         resolve({ remainingQuantity: specialDay.initialQuantity, isQuantityDependent: true });
//       }
//       resolve({ remainingQuantity: initialQuantity, isQuantityDependent: true });
//     }
//     resolve({ remainingQuantity: itemQntyTrckr.remainingQuantity, isQuantityDependent: true });
//   });
// };

const emptyCart = catchAsync(async (req, res) => {
  // start: update cart
  const { user } = req;
  await cartService.emptyCart(user.cartId);

  const data = {
    placeId: null,
    slotId: null,
    couponId: null,
    items: [],
    date: null,
    totalAmount: 0,
    couponDiscount: 0,
    totalAmountWithoutDiscount: 0,
    pointsDiscount: 0,
    tax: 0,
    amountToBePaid: 0,
  };
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

const updateCart = catchAsync(async (req, res) => {
  // start: update cart
  const { user } = req;
  let { items } = req.body;
  const { slotId, date, couponId, placeId, applyCash } = req.body;
  console.log('---req.body-----', req.body);
  const place = await placeService.getPlaceById(
    placeId,
    'isTemporarilyClosed isPublished isDeleted closedDays specificOffDays slots'
  );

  if (items.length === 0) {
    await cartService.emptyCart(user.cartId);

    const data = {
      placeId: null,
      slotId: null,
      couponId: null,
      items: [],
      date: null,
      totalAmount: 0,
      couponDiscount: 0,
      totalAmountWithoutDiscount: 0,
      pointsDiscount: 0,
      tax: 0,
      amountToBePaid: 0,
    };
    return res.status(httpStatus.OK).send(
      success(
        'CRT006',
        {
          cart: data,
        },
        httpStatus.OK
      )
    );
  }
  const itemQuantity = {};
  const itemIds = items.map((item) => {
    itemQuantity[item.itemId] = { quantity: item.quantity };
    return mongoose.Types.ObjectId(item.itemId);
  });
  let totalAmountWithoutDiscount = 0;
  let totalAmount = 0;
  items = await itemService.getItems(
    { _id: { $in: itemIds }, placeId: mongoose.Types.ObjectId(placeId) },
    'specialDays isQuantityDependent initialQuantity originalPrice currentPrice tax extraCharges'
  );
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
  let itemQntyTrckrers = [];
  if (itemWithQntities.length > 0) {
    itemQntyTrckrers = await itemQuantityTrackerService.getItemQuantityTrackers({
      date: new Date(new Date(date).setHours(0, 0, 0, 0)),
      slotId: mongoose.Types.ObjectId(slotId),
      itemId: { $in: itemWithQntities.map((item) => mongoose.Types.ObjectId(item._id)) },
      placeId: mongoose.Types.ObjectId(placeId),
    });
    const itemQntyTrackerFound = {};
    for (const itemQntyTrckrer of itemQntyTrckrers) {
      itemQntyTrackerFound[itemQntyTrckrer.itemId] = true;
    }

    for (const itemWithQntity of itemWithQntities) {
      if (!itemQntyTrackerFound[itemWithQntity._id]) {
        const itemQntyTracker = await itemQuantityTrackerService.createItemQuantityTracker({
          date: new Date(new Date(date).setHours(0, 0, 0, 0)),
          slotId: mongoose.Types.ObjectId(slotId),
          itemId: itemWithQntity._id,
          placeId: mongoose.Types.ObjectId(placeId),
          remainingQuantity: itemQuantity[itemWithQntity._id].remainingQuantity,
        });
        itemQntyTrckrers.push(itemQntyTracker);
      }
    }
  }

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
        type: 'quantity',
        isFinished: itemQuantity[itmqntytrckr.itemId].remainingQuantity === 0,
      });
    }
  });

  // placeId = placeId.toString();

  // calculate tax
  const tax = await calculateTaxAndCharges({
    items,
    itemQuantity,
  });

  let amountToBePaid = totalAmount + tax;

  let couponDiscount = 0;
  let couponInvalidMessage = null;
  if (couponId) {
    const coupon = await couponService.getCouponById(couponId);
    couponInvalidMessage = await validateCoupon({ coupon, placeId, itemQuantity, items, slotId, userId: req.user.id });
    if (!couponInvalidMessage) {
      couponDiscount = calculateDiscount({
        coupon,
        amountToBePaid,
      });
    }
    amountToBePaid -= couponDiscount;
  }

  let pointsDiscount = 0;
  if (applyCash) {
    const userInfo = await userService.getUserById(req.user.id, 'points');
    const pointsConfig = await configurationService.getConfiguration({ code: 'MAX_POINTS_USE_PER_ORDER' });
    pointsDiscount = userInfo.points > pointsConfig.value ? pointsConfig.value : userInfo.points;
    amountToBePaid -= pointsDiscount;
  }

  const data = {
    // placeId,
    // slotId,
    // couponId,
    // items: items.map((item) => ({ itemId: item._id, quantity: itemQuantity[item._id.toString()].quantity })),
    // date,
    totalAmount,
    couponDiscount,
    totalAmountWithoutDiscount,
    pointsDiscount,
    tax,
    amountToBePaid,
    couponInvalidMessage,
    // placeId,
    // items,
    // couponDiscount,
    // amountToBePaid,
    // pointsDiscount,
    // totalAmountWithoutDiscount,
    // tax,
    // couponId: couponData.isNotApplicable ? null : coupon.couponId,
    // updatedBy: req.user.id,
    // updatedOn: new Date(),
    // unapplicableReason: couponData.unapplicableReason,
    // items,
  };
  await cartService.updateCartById(user.cartId, {
    $set: {
      ...data,
      placeId,
      slotId,
      couponId,
      items: items.map((item) => ({ itemId: item._id, quantity: itemQuantity[item._id.toString()].quantity })),
      date,
      updatedBy: req.user.id,
      updatedOn: new Date(),
    },
  });

  const isPlaceInactive = place.isTemporarilyClosed || !place.isPublished || place.isDeleted;
  const weekDay = getWeekDay(date);
  const isPlaceInactiveForCurrentDate =
    place.closedDays.find((day) => weekDay === day) ||
    place.specificOffDays.find(
      (specificOffDay) => new Date(specificOffDay).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)
    );
  const selectedSlot = place.slots.find((slot) => slot._id.toString() === slotId.toString());
  const endingDateTime = new Date(date).setHours(
    selectedSlot.meridiem === 'PM' ? selectedSlot.endTime.hour + 12 : selectedSlot.endTime.hour,
    selectedSlot.endTime.minute
  );

  const isSlotInactive = !(
    selectedSlot &&
    new Date(selectedSlot.activeFrom).setHours(0, 0, 0, 0) < new Date(date) &&
    (!selectedSlot.activeTill || new Date(selectedSlot.activeTill).setHours(0, 0, 0, 0) >= new Date(date)) &&
    !selectedSlot.inactiveOn.find(
      (inactiveOn) => new Date(inactiveOn).setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)
    ) &&
    endingDateTime > new Date()
  );
  const hasPlaceSpecificError =
    isPlaceInactive || isSlotInactive || isPlaceInactiveForCurrentDate || (errors && errors.length > 0);

  if (hasPlaceSpecificError) {
    console.log(
      '----w',
      error(
        'CRT006',
        {
          isPlaceInactive,
          isSlotInactive,
          isPlaceInactiveForCurrentDate,
          errors,
          cart: data,
        },
        httpStatus.OK
      ),
      '----'
    );
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
  res.status(httpStatus.OK).send(
    success(
      'CRT006',
      {
        cart: data,
      },
      httpStatus.OK
    )
  );
});

const applyWalletCash = catchAsync(async (req, res) => {
  const { applyCash } = req.params;
  const cart = await cartService.getCart({ userId: mongoose.Types.ObjectId(req.user.id) }, [
    'placeId',
    'couponId',
    'items.itemId',
  ]);
  // calcuate total amount of item
  if (!cart.items.length) return res.status(httpStatus.OK).send(success('CRT004', { cart }, httpStatus.OK));

  let totalAmountWithoutDiscount = 0;
  let totalAmount = 0;

  let { items } = cart;
  const { date } = cart;

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
      isQuantityDependent: true,
      remainingQuantity: specialDay ? specialDay.initialQuantity : initialQuantity,
    };
    return true;
  });

  const itemQntyTrckrers = await itemQuantityTrackerService.getItemQuantityTrackers({
    date: new Date(new Date(date).setHours(0, 0, 0, 0)),
    slotId: cart.slotId,
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
        type: 'quantity',
        isFinished: itemQuantity[itmqntytrckr.itemId].remainingQuantity === 0,
      });
    }
  });

  // placeId = placeId.toString();

  // calculate tax
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
  if (applyCash) {
    const userInfo = await userService.getUserById(req.user.id, 'points');
    const pointsConfig = await configurationService.getConfiguration({ code: 'MAX_POINTS_USE_PER_ORDER' });
    pointsDiscount = userInfo.points > pointsConfig.value ? pointsConfig.value : userInfo.points;
    amountToBePaid -= pointsDiscount;
  }

  const data = {
    placeId: cart.placeId,
    slotId: cart.slotId,
    date: cart.date,
    couponDiscount,
    amountToBePaid,
    pointsDiscount,
    totalAmount,
    totalAmountWithoutDiscount,
    tax,
    couponId: cart.couponId,
    updatedBy: req.user.id,
    updatedOn: new Date(),
    couponInvalidMessage,
    items: cart.items,
  };
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

  const isPlaceInactive = cart.placeId.isTemporarilyClosed || !cart.placeId.isPublished || cart.placeId.isDeleted;
  const weekDay = getWeekDay(cart.date);
  const isPlaceInactiveForCurrentDate =
    cart.placeId.closedDays.find((day) => weekDay === day) ||
    cart.placeId.specificOffDays.find(
      (specificOffDay) => new Date(specificOffDay).setHours(0, 0, 0, 0) === new Date(cart.date).setHours(0, 0, 0, 0)
    );
  const selectedSlot = cart.placeId.slots.find((slot) => slot._id.toString() === cart.slotId.toString());
  const isSlotInactive = !(
    new Date(selectedSlot.activeFrom).setHours(0, 0, 0, 0) < new Date(cart.date) &&
    !(!selectedSlot.activeTill || new Date(selectedSlot.activeTill).setHours(0, 0, 0, 0) >= new Date(cart.date)) &&
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

const deleteCart = catchAsync(async (req, res) => {
  await cartService.deleteCartById(req.params.cartId, { deletedBy: req.user.id, deletedOn: new Date() });
  return res.status(httpStatus.NO_CONTENT).send(success('CRT007', {}, httpStatus.NO_CONTENT));
});

module.exports = {
  createCart,
  getCarts,
  getCart,
  updateCart,
  deleteCart,
  getMyCart,
  // changeDate,
  applyWalletCash,
  emptyCart,
};
