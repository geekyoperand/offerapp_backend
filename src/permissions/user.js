const auth = ['addRequiredAccountDetails', 'me', 'updateProfileDetails'];
const banner = [];
const cart = ['getMyCart', 'emptyCart', 'updateCart'];
const category = ['getAllCategories'];
const configuration = [];
const coupon = ['getActiveCoupons', 'applyCoupon', 'removeCoupon'];
const couponappliedhistory = [];
const device = [];
const favorite = ['createFavorite', 'getFavorites', 'getAllFavorites'];
const queryTicket = ['getQueryTickets'];
const field = [];
const form = [];
const item = ['getItems'];
const manager = [];
const locationHistory = [];
const lookup = [];
const message = [];
const notification = ['getNotifications', 'markNotificationsAsRead'];
const order = ['placeOrder', 'getOrders', 'getOrder', 'postOrderRating'];
const place = ['getPlaces', 'getPlace', 'searchPlaces'];
const pointhistory = ['getPointHistories'];
const pricehistory = [];
const refferalhistory = ['getRefferalHistories'];
const search = ['getSearches'];
const subscription = [];
const transaction = [];
const user = [];
const viewhistory = ['getViewHistories'];

const roles = [
  ...auth,
  ...banner,
  ...cart,
  ...category,
  ...configuration,
  ...coupon,
  ...couponappliedhistory,
  ...device,
  ...favorite,
  ...queryTicket,
  ...field,
  ...form,
  ...item,
  ...manager,
  ...locationHistory,
  ...lookup,
  ...message,
  ...notification,
  ...order,
  ...place,
  ...pointhistory,
  ...pricehistory,
  ...refferalhistory,
  ...search,
  ...subscription,
  ...transaction,
  ...user,
  ...viewhistory,
];
module.exports = roles;
