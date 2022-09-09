const express = require('express');
const authRoute = require('./auth.route');
const bannerRoute = require('./banner.route');
const cartRoute = require('./cart.route');
const categoryRoute = require('./category.route');
const homeRoute = require('./home.route');
const configurationRoute = require('./configuration.route');
const couponRoute = require('./coupon.route');
const couponAppliedHistoryRoute = require('./couponappliedhistory.route');
const deviceRoute = require('./device.route');
const docsRoute = require('./docs.route');
const favoriteRoute = require('./favorite.route');
const queryTicketRoute = require('./queryticket.route');
const fieldRoute = require('./field.route');
const formRoute = require('./form.route');
const itemsRoute = require('./item.route');
const locationHistoryRoute = require('./locationhistory.route');
const lookupRoute = require('./lookup.route');
const managerRoute = require('./manager.route');
const messageRoute = require('./message.route');
const notificationRoute = require('./notification.route');
const orderRoute = require('./order.route');
const placeRoute = require('./place.route');
const pointHistoryRoute = require('./pointhistory.route');
const priceHistoryRoute = require('./pricehistory.route');
const refferalHistoryRoute = require('./refferalhistory.route');
const searchRoute = require('./search.route');
const subscriptionRoute = require('./subscription.route');
const transactionRoute = require('./transaction.route');
const userRoute = require('./user.route');
const viewHistoryRoute = require('./viewhistory.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/',
    route: homeRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/banners',
    route: bannerRoute,
  },
  {
    path: '/carts',
    route: cartRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },
  {
    path: '/configurations',
    route: configurationRoute,
  },
  {
    path: '/coupons',
    route: couponRoute,
  },
  {
    path: '/couponappliedhistories',
    route: couponAppliedHistoryRoute,
  },
  {
    path: '/device',
    route: deviceRoute,
  },
  {
    path: '/favorites',
    route: favoriteRoute,
  },
  {
    path: '/querytickets',
    route: queryTicketRoute,
  },
  {
    path: '/fields',
    route: fieldRoute,
  },
  {
    path: '/forms',
    route: formRoute,
  },
  {
    path: '/items',
    route: itemsRoute,
  },
  {
    path: '/manager',
    route: managerRoute,
  },
  {
    path: '/locationhistories',
    route: locationHistoryRoute,
  },
  {
    path: '/lookups',
    route: lookupRoute,
  },
  {
    path: '/messages',
    route: messageRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/places',
    route: placeRoute,
  },
  {
    path: '/pointhistories',
    route: pointHistoryRoute,
  },

  {
    path: '/pricehistories',
    route: priceHistoryRoute,
  },
  {
    path: '/refferalhistories',
    route: refferalHistoryRoute,
  },
  {
    path: '/search',
    route: searchRoute,
  },
  {
    path: '/subscription',
    route: subscriptionRoute,
  },
  {
    path: '/transactions',
    route: transactionRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/viewhistory',
    route: viewHistoryRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
