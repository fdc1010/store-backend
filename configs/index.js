module.exports.PRIZE_TYPE = {
  DOLLARS: 1,
  POINTS: 2,
};

module.exports.SPIN_CONTROL_STATUS = {
  DISABLED: 0,
  ACTIVE: 1,
  REMOVED: 2,
}

module.exports.SPINWHEEL_SETTING_STATUS = {
  DISABLED: 0,
  ACTIVE: 1,
  REMOVED: 2,
}

// Since role is based on db
// Should be updated.
module.exports.ROLES = {
  ADMIN: 1,
  USER: 2,
  MERCHANT: 3,
}

module.exports.ORDER_STATUS = {
  PENDING: 0,
  PAYMENT_ACCEPTED: 1,
  PROCESSED: 2,
  SHIPPED: 3, // READY TO SHIP
  COMPLETED: 4,
  CANCELED: 5,
  MERCHANT_CANCLED: 6,
  DELIVERY_FAILED: 7,
  PARCEL_LOST: 8,
  FAILED_PICKUP: 9,
  RETURNED_TO_HUB: 10,
  RETURNED_TO_SENDER: 11,
  ASSIGNED_PICKUP: 12,
  PENDING_PICKUP: 13,
  ACCEPTED_PICKUP: 14,
  ENROUTE_TO_HUB: 15,
  RESCHEDULE_DELIVER: 16,
  FORWARDED_TO_SHIPPING_PARTNER: 17,
  SCHEDULED_RTS: 18,
  FAILED_RTS: 19,
  OUT_FOR_RTS: 20,
  PARCEL_DISPOSED: 21,
  PARCEL_LEAKAGE: 22,
  PARCEL_DAMAGED: 23,
}

module.exports.USER_POINTS_TYPE = {
  SPINWHEEL: 1,
  REDEEM_POINTS: 2, // points be used when checkout
}

module.exports.USER_INVEST_POINTS_TYPE = {
  ADD_FROM_INVEST: 1,
  REDEEM_POINTS: 2, // points be used when checkout
}

module.exports.PRIZE_STATUS = {
  DISABLED: 0,
  ACTIVE: 1,
  REMOVED: 2,
}

module.exports.DAY_OF_WEEK = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
}

module.exports.DEFAULT_MERCHANT_COLOR_SETTINGS = {
  primary_color: '32458D',
  // primary_dark_color: '32458D',
  // primary_light_color: 'E5E9F5',
  // secondary_color: '59beb9',
  // secondary_dark_color: 'FAC40D',
  // secondary_light_color: '526BB9',
}

module.exports.APP_ENDPOINT = {
  IOS: 'https://itunes.apple.com/us/app/id1570230417',
  ANDROID: 'https://play.google.com/store/apps/details?id=fdc.store.backend',
}

module.exports.DELIVERY_TYPE = {
  MOTORCYCLE: 'MOTORCYCLE',
}

module.exports.MERCHANT_TYPE = {
  NORMAL: 1,
  FOOD: 2,
}

module.exports.ORDER_TYPE = {
  NORMAL: 1,
  FOOD: 2,
}

module.exports.ORDER_DELIVERY_TYPE = {
  ASSIGNING_DRIVER: 'ASSIGNING_DRIVER',
  ON_GOING: 'ON_GOING',
  PICKED_UP: 'PICKED_UP',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
  REJECTED: 'REJECTED',
}

module.exports.NOTIFICATION_TYPE = {
  NONE: 0,
  PRODUCT_LIKE: 1,
  CHAT: 2,
  PROMOTION: 3,
  NEWSLETTER: 4,
  ORDER_PLACED: 5,
  ORDER_PAID: 6,
  ORDER_RECEIVED: 7,
  PAYMENT_FAILED: 8,
  USER_POINTS: 9,
  USER_PRIZES: 10,
  USER_SPINWHEEL: 11
};

module.exports.PAYMENT_METHODS = {
  PAYNOW: 'paynow_online',
  CARD: 'card',
}

module.exports.VOUCHER_TRIGGER = {
  NEW_USER: 1,
  GLOBAL_VOUCHER: 2,
}

module.exports.PRODUCT_TYPES = {
  NORMAL: 1,
  INSURANCE: 2,
  CROWDFUND: 3,
}

module.exports.SCHEDULE_CALL_TYPES = {
  INSURANCE: 2,
  CROWDFUND: 3,
}

module.exports.SCHEDULE_CALL_STATUS = {
  ACTIVE: 1,
  FINISHED: 2,
  DELETED: 3,
}

module.exports.POPUP_SETTINGS_STATUS = {
  ACTIVE: 1,
  DISABLED: 2,
  DELETED: 3,
}

module.exports.POPUP_SETTINGS_TYPE = {
  ONLY_BANNER: 1,
  PRODUCT: 2,
  WEBSITE: 3,
}

module.exports.NEWS_NOTIFICATION_STATUS = {
  ACTIVE: 1,
  REMOVED: 2,
}

module.exports.NEWS_NOTIFICATION_TYPES = {
  promotion: 1,
  news: 2,
  prize: 3,
}

module.exports.EVENT_STATUS = {
  ACTIVE: 1,
  DISABLED: 2,
  REMOVED: 3,
}

module.exports.EVENT_TYPES = {
  FLASH_DEAL: 1,
}

module.exports.EVENT_ITEM_TYPES = {
  PRODUCT_FLASH_DEAL: 1,
}

module.exports.EVENT_ITEM_STATUS = {
  ACTIVE: 1,
  REMOVED: 2,
}

module.exports.BANNER_STATUS = {
  ACTIVE: 1,
  DISABLED: 2,
  REMOVED: 3,
}

module.exports.MERCHANT_INDUSTRY_STATUS = {
  ACTIVE: 1,
  DISABLED: 2,
  REMOVED: 3,
}

module.exports.MERCHANT_STATUS = {
  PENDING: 0,
  ACTIVE: 1,
  DISABLED: 2
}

module.exports.PRODUCT_STATUS = {
  INACTIVE: 0,
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  LIVE: 4,
  DRAFT: 5,
}

const SEARCH_MERCHANT_TYPES = {
  NAME: 'name',
  PHONE: 'phone',
  ACRA_NUMBER: 'acra',
  WEBSITE: 'web',
  OFFICE_ADDRESS: 'address',
  POSTAL_CODE: 'postal',
  EMAIL: 'email',
  CONTACT_NAME: 'contact_name'
}

module.exports.SEARCH_MERCHANT_TYPES = SEARCH_MERCHANT_TYPES;
const SEARCH_MERCHANT_FIELDS = {
  [SEARCH_MERCHANT_TYPES.NAME]: 'name',
  [SEARCH_MERCHANT_TYPES.ACRA_NUMBER]: 'acra_number',
  [SEARCH_MERCHANT_TYPES.WEBSITE]: 'website',
  [SEARCH_MERCHANT_TYPES.PHONE]: 'office_phone_number',
  [SEARCH_MERCHANT_TYPES.OFFICE_ADDRESS]: 'office_address',
  [SEARCH_MERCHANT_TYPES.POSTAL_CODE]: 'postal_code',
  [SEARCH_MERCHANT_TYPES.EMAIL]: '$user.email$',
  [SEARCH_MERCHANT_TYPES.CONTACT_NAME]: '$user.name$',
}
module.exports.SEARCH_MERCHANT_FIELDS = SEARCH_MERCHANT_FIELDS;

module.exports.ASSET_FILE_TYPES = {
  IMAGE: 1,
  VIDEO: 2,
}

module.exports.REVIEW_STORAGE_FOLDER = 'reviews';
module.exports.DEFAULT_CROWDFUND_AVAILABLE_VALUE = 5000;
module.exports.BMART_FEE = 0.05; // 5%
module.exports.BASE_URL = process.env.NODE_ENV === 'production' ? 'https://fdc.store.backend' : 'https://staging.fdc.store.backend';
