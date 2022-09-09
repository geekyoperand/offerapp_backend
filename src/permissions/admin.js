const banner = ['createBanner', 'getBanners', 'getActiveBanners', 'getBanner', 'updateBanner', 'deleteBanner'];
const cart = ['createCart', 'getCarts', 'getMyCart', 'getCart', 'updateCart', 'deleteCart'];
const category = ['createCategory', 'getCategories', 'getAllCategories', 'getCategory', 'updateCategory', 'deleteCategory'];
const configuration = [
  'createConfiguration',
  'getConfigurations',
  'getAllConfigurations',
  'getConfiguration',
  'updateConfiguration',
  'deleteConfiguration',
];
const coupon = [
  'createCoupon',
  'getCoupons',
  'getActiveCoupons',
  'applyCoupon',
  'removeCoupon',
  'getCoupon',
  'updateCoupon',
  'deleteCoupon',
];
const couponappliedhistory = [
  'createCouponAppliedHistory',
  'getCouponAppliedHistories',
  'getCouponAppliedHistory',
  'updateCouponAppliedHistory',
  'deleteCouponAppliedHistory',
];
const favorite = ['createFavorite', 'getFavorites', 'getFavorite', 'updateFavorite', 'deleteFavorite'];
const queryTicket = [
  'createQueryTicket',
  'getQueryTickets',
  'addQueryTicketComment',
  'getQueryTicket',
  'updateQueryTicket',
  'deleteQueryTicket',
  'deleteQueryTicketComment',
];
const field = ['createField', 'getFields', 'getField', 'updateField', 'deleteField'];
const form = ['createForm', 'getForms', 'getForm', 'updateForm', 'deleteForm', 'getUIConfig'];
const location = ['createLocation', 'getLocations', 'getLocation', 'updateLocation', 'deleteLocation'];
const lookup = ['createLookup', 'getLookups', 'getAllLookups', 'getLookup', 'updateLookup', 'deleteLookup'];
const message = ['createMessage', 'getMessages', 'getAllMessages', 'getMessage', 'updateMessage', 'deleteMessage'];
const notification = [
  'createNotification',
  'getNotifications',
  'getNotification',
  'updateNotification',
  'deleteNotification',
];
const order = ['placeOrder', 'getOrders', 'getOrder', 'updateOrder', 'deleteOrder'];
const place = ['createPlace', 'getPlaces', 'getPlace', 'updatePlace', 'deletePlace'];
const pointhistory = [
  'createPointHistory',
  'getPointHistories',
  'getPointHistory',
  'updatePointHistory',
  'deletePointHistory',
];
const pricehistory = [
  'createPriceHistory',
  'getPriceHistories',
  'getPriceHistory',
  'updatePriceHistory',
  'deletePriceHistory',
];
const refferalhistory = [
  'createRefferalHistory',
  'getRefferalHistories',
  'getRefferalHistory',
  'updateRefferalHistory',
  'deleteRefferalHistory',
];
const transaction = ['createTransaction', 'getTransactions', 'getTransaction', 'updateTransaction', 'deleteTransaction'];
const viewhistory = ['createViewHistory', 'getViewHistories', 'getViewHistory', 'updateViewHistory', 'deleteViewHistory'];

const roles = [
  ...banner,
  ...cart,
  ...category,
  ...configuration,
  ...coupon,
  ...couponappliedhistory,
  ...favorite,
  ...queryTicket,
  ...field,
  ...form,
  ...location,
  ...lookup,
  ...message,
  ...notification,
  ...order,
  ...place,
  ...pointhistory,
  ...pricehistory,
  ...refferalhistory,
  ...transaction,
  ...viewhistory,
];
module.exports = roles;
