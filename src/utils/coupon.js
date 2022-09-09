const mongoose = require('mongoose');
const { couponQuanityTypes, couponTypes } = require('../constants');
const { couponappliedhistoryService, orderService } = require('../services');

const validateCoupon = async ({ coupon, placeId, slotId, itemQuantity, userId, items, amountToBePaid }) => {
  const {
    isActive,
    activeFrom,
    activeTill,
    places,
    inactiveOn,
    minTickets,
    count,
    quantityType,
    maxTimes,
    isUsageLimit,
    isForFirstOrder,
    minCartValue,
  } = coupon;

  const isCurrentlyActive = new Date(activeFrom) <= new Date() && (!activeTill || new Date(activeTill) >= new Date());
  if (!isCurrentlyActive) {
    return 'CPN005';
  }

  if (!isActive || inactiveOn.find((ele) => new Date(ele).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0))) {
    return 'CPN007';
  }
  if (minCartValue > amountToBePaid) {
    return 'CPN021';
  }

  if (isForFirstOrder) {
    const totalOrders = await orderService.getOrdersCount({
      userId: mongoose.Types.ObjectId(userId),
    });
    if (totalOrders) {
      return 'CPN020';
    }
  }

  if (places && places.length > 0) {
    let isPlaceFound = false;
    const placeAndSlotFound =
      places &&
      !!places.find((place) => {
        if (place.placeId === placeId && !place.slotId) return true;
        if (place.placeId === placeId) {
          isPlaceFound = true;
        }
        if (place.placeId === placeId && slotId === place.slotId) return true;
        return false;
      });
    if (!placeAndSlotFound) {
      if (isPlaceFound) return 'CPN018';
      return 'CPN006';
    }
  }

  if (minTickets) {
    let totalQuantity = 0;
    items.forEach((ele) => {
      totalQuantity += itemQuantity[ele._id];
    });
    if (minTickets > totalQuantity) {
      return 'CPN019';
    }
  }

  if (quantityType === couponQuanityTypes.LIMITED && count <= 0) {
    return 'CPN008';
  }
  if (isUsageLimit) {
    const appliedCount = await couponappliedhistoryService.getCouponAppliedHistoriesCount({
      couponId: coupon._id,
      userId: mongoose.Types.ObjectId(userId),
    });
    if (appliedCount >= maxTimes) {
      return 'CPN009';
    }
  }
  return null;
};

const calculateDiscount = ({ coupon, amountToBePaid }) => {
  const { type, maxDiscount } = coupon;
  let discount = 0;
  if (type === couponTypes.FIXED_AMOUNT) {
    discount = coupon.discountAmount;
  } else if (type === couponTypes.PERCENTAGE) {
    discount = coupon.discountPercentage * amountToBePaid * 0.01;
    if (maxDiscount && maxDiscount < discount) {
      discount = maxDiscount;
    }
  } else if (type === couponTypes.CASHBACK) {
    discount = 0;
  }
  return discount;
};

module.exports = {
  validateCoupon,
  calculateDiscount,
};
