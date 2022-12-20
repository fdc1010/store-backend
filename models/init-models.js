var DataTypes = require("sequelize").DataTypes;
var _banners = require("./banners");
var _billing_details = require("./billing_details");
var _cart_items = require("./cart_items");
var _carts = require("./carts");
var _email_notifications = require("./email_notifications");
var _faqs = require("./faqs");
var _merchant_categories = require("./merchant_categories");
var _merchants = require("./merchants");
var _notifications = require("./notifications");
var _order_items = require("./order_items");
var _order_item_logs = require("./order_item_logs");
var _order_logs = require("./order_logs");
var _order_payment_logs = require("./order_payment_logs");
var _orders = require("./orders");
var _payments = require("./payments");
var _prize_settings = require("./prize_settings");
var _product_assets = require("./product_assets");
var _product_brands = require("./product_brands");
var _product_categories = require("./product_categories");
var _product_deliveries = require("./product_deliveries");
var _product_likes = require("./product_likes");
var _product_reviews = require("./product_reviews");
var _product_review_replies = require("./product_review_replies");
var _products = require("./products");
var _push_notifications = require("./push_notifications");
var _roles = require("./roles");
var _shipping_details = require("./shipping_details");
var _spinwheel_settings = require('./spinwheel_settings');
var _user_addresses = require("./user_addresses");
var _user_vouchers = require("./user_vouchers");
var _users = require("./users");
var _vouchers = require("./vouchers");
var _user_fcms = require("./user_fcms");
var _manufacturers = require("./manufacturers");
var _point_settings = require("./point_settings");
var _user_points = require("./user_points");
var _user_prize_logs = require("./user_prize_logs");
var _daily_spin_control = require("./daily_spin_control");
var _user_spinwheel = require("./user_spinwheel");
var _user_store_invest_points = require("./user_store_invest_points");
var _settings = require('./settings');
var _schedule_call = require('./schedule_call');
var _products_crowdfund = require('./products_crowdfund');
var _products_insurance = require('./products_insurance');
var _popup_settings = require('./popup_settings');
var _qxpress_pickup = require('./qxpress_pickup');
var _news_notifications = require('./news_notifications');
var _events = require('./events');
var _event_items = require('./event_items');
var _merchant_industries = require('./merchant_industries');
var _review_assets = require('./review_assets');

function initModels(sequelize) {
  var banners = _banners(sequelize, DataTypes);
  var billing_details = _billing_details(sequelize, DataTypes);
  var cart_items = _cart_items(sequelize, DataTypes);
  var carts = _carts(sequelize, DataTypes);
  var email_notifications = _email_notifications(sequelize, DataTypes);
  var faqs = _faqs(sequelize, DataTypes);
  var merchant_categories = _merchant_categories(sequelize, DataTypes);
  var merchants = _merchants(sequelize, DataTypes);
  var notifications = _notifications(sequelize, DataTypes);
  var order_items = _order_items(sequelize, DataTypes);
  var order_item_logs = _order_item_logs(sequelize, DataTypes);
  var order_logs = _order_logs(sequelize, DataTypes);
  var order_payment_logs = _order_payment_logs(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var payments = _payments(sequelize, DataTypes);
  var prize_settings = _prize_settings(sequelize, DataTypes);
  var product_assets = _product_assets(sequelize, DataTypes);
  var product_brands = _product_brands(sequelize, DataTypes);
  var product_categories = _product_categories(sequelize, DataTypes);
  var product_deliveries = _product_deliveries(sequelize, DataTypes);
  var product_likes = _product_likes(sequelize, DataTypes);
  var product_reviews = _product_reviews(sequelize, DataTypes);
  var product_review_replies = _product_review_replies(sequelize, DataTypes);
  var products = _products(sequelize, DataTypes);
  var push_notifications = _push_notifications(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var shipping_details = _shipping_details(sequelize, DataTypes);
  var spinwheel_settings = _spinwheel_settings(sequelize, DataTypes);
  var user_addresses = _user_addresses(sequelize, DataTypes);
  var user_vouchers = _user_vouchers(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var vouchers = _vouchers(sequelize, DataTypes);
  var user_fcms = _user_fcms(sequelize, DataTypes);
  var manufacturers = _manufacturers(sequelize, DataTypes);
  var point_settings = _point_settings(sequelize, DataTypes);
  var user_points = _user_points(sequelize, DataTypes);
  var user_prize_logs = _user_prize_logs(sequelize, DataTypes);
  var daily_spin_control = _daily_spin_control(sequelize, DataTypes);
  var user_spinwheel = _user_spinwheel(sequelize, DataTypes);
  var user_store_invest_points = _user_store_invest_points(sequelize, DataTypes);
  var settings = _settings(sequelize, DataTypes);
  var schedule_calls = _schedule_call(sequelize, DataTypes);
  var products_crowdfund = _products_crowdfund(sequelize, DataTypes);
  var products_insurance = _products_insurance(sequelize, DataTypes);
  var popup_settings = _popup_settings(sequelize, DataTypes);
  var qxpress_pickup = _qxpress_pickup(sequelize, DataTypes);
  var news_notifications = _news_notifications(sequelize, DataTypes);
  var events = _events(sequelize, DataTypes);
  var event_items = _event_items(sequelize, DataTypes);
  var merchant_industries = _merchant_industries(sequelize, DataTypes);
  var review_assets = _review_assets(sequelize, DataTypes);

  billing_details.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  billing_details.belongsTo(users, { as: "user", foreignKey: "user_id"});

  cart_items.belongsTo(carts, { as: "cart", foreignKey: "cart_id"});
  cart_items.belongsTo(products, { as: "product", foreignKey: "product_id"});
  cart_items.belongsTo(events, { as: 'event', foreignKey: 'event_id' });

  carts.hasMany(cart_items, { as: "cart_items", foreignKey: "cart_id"});
  carts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  carts.belongsTo(vouchers, { as: "voucher", foreignKey: "voucher_id"});
  carts.belongsTo(user_addresses, { as: 'address', foreignKey: 'address_id' });

  // daily_spin_control.hasMany(user_spinwheel, { as: "user_spinwheel", foreignKey: "daily_spinwheel_control_id"});

  email_notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});

  merchants.belongsTo(users, { as: "user", foreignKey: "user_id"});
  merchants.belongsTo(merchant_industries, { as: 'merchant_industry', foreignKey: 'industry' });
  merchants.hasMany(products, { as: "products", foreignKey: "merchant_id"});
  merchants.hasMany(product_categories, { as: "category", foreignKey: "merchant_id"});
  merchants.hasMany(merchant_categories, { as: "merchant_categories", foreignKey: "merchant_id"});
  
  merchant_categories.belongsTo(merchants, { as: "merchant", foreignKey: "merchant_id"});
  merchant_categories.belongsTo(product_categories, { as: "category", foreignKey: "category_id"});

  notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});
  notifications.belongsTo(users, { as: "target_user", foreignKey: "target_user_id"});
  // notifications.belongsTo(orders, { as: "order", foreignKey: "ref_id"});
  // notifications.belongsTo(product_likes, { as: "product_like", foreignKey: "ref_id"});
  
  order_items.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  order_items.belongsTo(products, { as: "product", foreignKey: "product_id"});
  order_items.hasMany(order_item_logs, { as: "order_item_logs", foreignKey: "order_item_id"})

  order_logs.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  order_item_logs.belongsTo(order_items, { as: "order_item", foreignKey: "order_item_id"})

  order_payment_logs.belongsTo(orders, { as: "order", foreignKey: "order_id"});

  orders.hasMany(billing_details, { as: "billing_details", foreignKey: "order_id"});
  orders.hasMany(order_items, { as: "order_items", foreignKey: "order_id"});
  orders.hasMany(order_logs, { as: "order_logs", foreignKey: "order_id"});
  orders.hasMany(order_payment_logs, { as: "order_payment_logs", foreignKey: "order_id"});
  orders.hasMany(payments, { as: "payments", foreignKey: "order_id"});
  orders.hasMany(product_reviews, { as: "product_reviews", foreignKey: "order_id"});
  orders.hasMany(shipping_details, { as: "shipping_details", foreignKey: "order_id"});
  orders.hasOne(shipping_details, { as: "shipping_detail", foreignKey: "order_id"});
  orders.belongsTo(users, { as: "user", foreignKey: "user_id"});
  orders.belongsTo(vouchers, { as: "voucher", foreignKey: "voucher_id"});
  orders.hasMany(user_addresses, { as: "user_address", foreignKey: "order_id"});
  orders.belongsTo(merchants, { as: 'merchant', foreignKey: 'merchant_id' });

  payments.belongsTo(orders, { as: "order", foreignKey: "order_id"});

  point_settings.hasMany(user_points, { as: "user_points", foreignKey: "point_id"});

  prize_settings.hasMany(spinwheel_settings, { as: "prize_settings", foreignKey: "prize_id" });
  prize_settings.hasMany(user_prize_logs, { as: "user_prize_log", foreignKey: "prize_id" });

  product_assets.belongsTo(products, { as: "product", foreignKey: "product_id"});

  product_brands.hasMany(products, { as: "products", foreignKey: "brand_id"});
  product_brands.hasMany(vouchers, { as: "vouchers", foreignKey: "brand_id"});

  product_categories.hasMany(products, { as: "products", foreignKey: "category_id"});
  product_categories.belongsTo(merchants, { as: "merchants", foreignKey: "merchant_id"});
  product_categories.hasMany(vouchers, { as: "vouchers", foreignKey: "category_id"});
  product_categories.hasMany(merchant_categories, { as: "merchant_categories", foreignKey: "category_id"});

  product_deliveries.hasMany(products, { as: "products", foreignKey: "delivery_id"});

  product_likes.belongsTo(products, { as: "product", foreignKey: "product_id"});
  product_likes.belongsTo(users, { as: "user", foreignKey: "user_id"});

  product_reviews.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  product_reviews.belongsTo(products, { as: "product", foreignKey: "product_id"});
  product_reviews.belongsTo(users, { as: "user", foreignKey: "user_id"});
  product_reviews.hasMany(product_review_replies, { as: "product_review_replies", foreignKey: "product_review_id"});
  product_reviews.hasMany(review_assets, { as: 'assets', foreignKey: 'review_id' });
  product_reviews.belongsTo(order_items, { as: 'order_item', foreignKey: 'order_item_id' });
  
  product_review_replies.belongsTo(product_reviews, {as: "product_review", foreignKey: "product_review_id"});
  product_review_replies.belongsTo(users, {as: "user", foreignKey: "user_id"});

  products.belongsTo(product_brands, { as: "brand", foreignKey: "brand_id"});
  products.belongsTo(product_categories, { as: "category", foreignKey: "category_id"});
  products.belongsTo(product_deliveries, { as: "delivery", foreignKey: "delivery_id"});
  products.hasMany(cart_items, { as: "cart_items", foreignKey: "product_id"});
  products.hasMany(order_items, { as: "order_items", foreignKey: "product_id"});
  products.hasMany(product_assets, { as: "product_assets", foreignKey: "product_id"});
  products.hasMany(product_likes, { as: "product_likes", foreignKey: "product_id"});
  products.hasMany(product_reviews, { as: "product_reviews", foreignKey: "product_id"});
  products.belongsTo(merchants, { as: "merchants", foreignKey: "merchant_id"});
  products.hasMany(vouchers, { as: "vouchers", foreignKey: "product_id"});

  push_notifications.belongsTo(users, { as: "user", foreignKey: "user_id"});

  roles.hasMany(users, { as: "users", foreignKey: "role_id"});

  shipping_details.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  shipping_details.belongsTo(users, { as: "user", foreignKey: "user_id"});

  spinwheel_settings.belongsTo(prize_settings, { as: "prize_setting", foreignKey: "prize_id" });
  // spinwheel_settings.hasMany(user_spinwheel, { as: "user_spinwheel", foreignKey: "spinwheel_id"});

  user_addresses.belongsTo(users, { as: "user", foreignKey: "user_id"});
  user_addresses.belongsTo(users, {as: "user_add", foreignKey: "user_id"});
  user_addresses.belongsTo(orders, {as: "orders_add", foreignKey: "order_id"});

  // user_store_invest_points.belongsTo(users, {as: "user", foreignKey: "user_id"});

  user_fcms.belongsTo(users, { as: "user", foreignKey: "user_id"});

  user_points.belongsTo(point_settings, { as: "point_setting", foreignKey: "point_id"});
  user_points.belongsTo(users, { as: "user", foreignKey: "user_id"});

  user_prize_logs.belongsTo(users, {as: "user", foreignKey: "user_id"});
  user_prize_logs.belongsTo(prize_settings, {as: "prize_setting", foreignKey: "prize_id" });

  user_spinwheel.belongsTo(users, {as: "user", foreignKey: "user_id"});
  user_spinwheel.belongsTo(spinwheel_settings, { as: "spinwheel_setting", foreignKey: "spinwheel_id"});
  user_spinwheel.belongsTo(daily_spin_control, { as: "daily_spin_control", foreignKey: "daily_spinwheel_control_id"});

  user_vouchers.belongsTo(users, { as: "user", foreignKey: "user_id"});
  user_vouchers.belongsTo(vouchers, { as: "voucher", foreignKey: "voucher_id"});

  users.belongsTo(roles, { as: "role", foreignKey: "role_id"});
  users.hasMany(billing_details, { as: "billing_details", foreignKey: "user_id"});
  users.hasMany(carts, { as: "carts", foreignKey: "user_id"});
  users.hasMany(email_notifications, { as: "email_notifications", foreignKey: "user_id"});
  users.hasMany(merchants, { as: "merchants", foreignKey: "user_id"});
  users.hasOne(merchants, { as: "merchant", foreignKey: "user_id"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "user_id"});
  users.hasMany(notifications, { as: "target_notifications", foreignKey: "target_user_id"});
  users.hasMany(orders, { as: "orders", foreignKey: "user_id"});
  users.hasMany(product_likes, { as: "product_likes", foreignKey: "user_id"});
  users.hasMany(product_reviews, { as: "product_reviews", foreignKey: "user_id"});
  users.hasMany(push_notifications, { as: "push_notifications", foreignKey: "user_id"});
  users.hasMany(shipping_details, { as: "shipping_details", foreignKey: "user_id"});
  users.hasMany(user_addresses, { as: "user_addresses", foreignKey: "user_id"});
  users.hasMany(user_vouchers, { as: "user_vouchers", foreignKey: "user_id"});
  users.hasMany(user_points, { as: "user_points", foreignKey: "user_id"});
  users.hasMany(user_prize_logs, { as: "user_prize_log", foreignKey: "user_id"});
  users.hasMany(user_addresses, { as: "user_address", foreignKey: "user_id"});
  users.hasMany(user_spinwheel, { as: "user_spinwheel", foreignKey: "user_id"});
  users.hasOne(user_fcms, { as: 'user_fcms', foreignKey: 'user_id' });
  spinwheel_settings.hasMany(user_spinwheel, { as: "user_spinwheel", foreignKey: "spinwheel_id"});
  daily_spin_control.hasMany(user_spinwheel, { as: "user_spinwheel", foreignKey: "daily_spinwheel_control_id"});
  spinwheel_settings.belongsTo(daily_spin_control, { as: 'spin_control', foreignKey: 'spinwheel_id' });
  daily_spin_control.hasMany(spinwheel_settings, { as: 'options', foreignKey: 'spinwheel_id' });
  
  notifications.belongsTo(orders, { as: "order", foreignKey: "ref_id"});
  notifications.belongsTo(product_likes, { as: "product_like", foreignKey: "ref_id"});
  notifications.belongsTo(products, { as: "product", foreignKey: "ref_id"});

  user_store_invest_points.belongsTo(users, {as: "user", foreignKey: "user_id"});

  users.hasMany(user_store_invest_points, { as: "user_store_invest_points", foreignKey: "user_id"});

  vouchers.belongsTo(product_brands, { as: "brand", foreignKey: "brand_id"});
  vouchers.belongsTo(product_categories, { as: "category", foreignKey: "category_id"});
  vouchers.belongsTo(products, { as: "product", foreignKey: "product_id"});
  vouchers.hasMany(carts, { as: "carts", foreignKey: "voucher_id"});
  vouchers.hasMany(orders, { as: "orders", foreignKey: "voucher_id"});
  vouchers.hasMany(user_vouchers, { as: "user_vouchers", foreignKey: "voucher_id"});

  order_items.hasMany(product_reviews, { as: "product_reviews", foreignKey: 'order_item_id' });

  settings.belongsTo(product_categories, { as: 'category', foreignKey: 'target_id' });

  // schedule call
  schedule_calls.belongsTo(users, { as: 'user', foreignKey: 'user_id', });
  schedule_calls.belongsTo(products, { as: 'product', foreignKey: 'product_id' });
  schedule_calls.belongsTo(merchants, { as: 'merchant', foreignKey: 'merchant_id' });

  products_crowdfund.belongsTo(products, { as: 'product', foreignKey: 'product_id' });
  products_crowdfund.belongsTo(merchants, { as: 'merchant', foreignKey: 'merchant_id' });

  products_insurance.belongsTo(products, { as: 'product', foreignKey: 'product_id' });
  products_insurance.belongsTo(merchants, { as: 'merchant', foreignKey: 'merchant_id' });

  products.hasOne(products_crowdfund, { as: 'products_crowdfund', foreignKey: 'product_id' });
  products.hasOne(products_insurance, { as: 'products_insurance', foreignKey: 'product_id' });

  events.hasMany(event_items, { as: 'event_items', foreignKey: 'event_id' });
  event_items.belongsTo(events, { as: 'event', foreignKey: 'event_id' });
  event_items.belongsTo(products, { as: 'product', foreignKey: 'item_id' });

  // merchant_industries
  merchant_industries.hasMany(merchants, { as: 'merchants', foreignKey: 'industry' });
  // end merchant_industries

  // review asses
  review_assets.belongsTo(product_reviews, { as: 'product_review', foreignKey: 'review_id' });

  return {
    banners,
    billing_details,
    cart_items,
    carts,
    email_notifications,
    faqs,
    merchant_categories,
    merchants,
    notifications,
    order_items,
    order_item_logs,
    order_logs,
    order_payment_logs,
    orders,
    payments,
    prize_settings,
    product_assets,
    product_brands,
    product_categories,
    product_deliveries,
    product_likes,
    product_reviews,
    product_review_replies,
    products,
    push_notifications,
    roles,
    shipping_details,
    spinwheel_settings,
    user_addresses,
    user_vouchers,
    users,
    vouchers,
    user_fcms,
    manufacturers,
    point_settings,
    user_prize_logs,
    daily_spin_control,
    user_spinwheel,
    user_store_invest_points,
    settings,
    schedule_calls,
    products_crowdfund,
    products_insurance,
    popup_settings,
    qxpress_pickup,
    news_notifications,
    events,
    event_items,
    merchant_industries,
    review_assets,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
