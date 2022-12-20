const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const roleRouter = require('./role')
const productCategoryRouter = require('./product-category');
const productBrandRouter = require('./product-brand');
const merchantRouter = require('./merchant');
const productRouter = require('./product');
const cartRouter = require('./cart');
const voucherRouter = require('./voucher');
const productDeliveriesRouter = require('./product-deliveries'); // Added by Frank
const productAssetsRouter = require('./product-assets'); // Added by Frank
const orderRouter = require('./order');
const userAddressRouter = require('./user-address');
const reviewRouter = require('./reviews');
const pushNotificationRouter = require('./push-notifications');
const emailNotificationRouter = require('./email-notifications');
const bannerRouter = require('./banner');
const prizeSettingRouter = require('./prize-setting');
const spinwheelSettingRouter = require('./spinwheel-setting');
const userPointsRouter = require('./user-points');
const shippingDetailsRouter = require('./shipping-details');
const billingDetailsRouter = require('./billing-details');
const notificationRouter = require('./notification');
const manufacturerRouter = require('./manufacturer');
const pointSettingRouter = require('./point-setting');
const dailySpinControlRouter = require('./daily-spin-control');
const UserSpinWheelRouter = require('./user-spinwheel');
const userPrizeRouter = require('./user-prize');
const faqRouter = require('./faq');
const overviewRouter = require('./overview');
const DeliveryRoutes = require('./delivery');
const StatsRouter = require('./stats');
const WebhookRoutes = require('./webhook');
const SettingsRoutes = require('./settings');
const ScheduleCallRoutes = require('./schedule_call');
const PopupSettingsRoutes = require('./popup-settings');
const NewsNotifications = require('./news_notifications');
const EventRoutes = require('./events');
const EventItemRoutes = require('./event_items');
const MerchantIndustriesRoutes = require('./merchant_industries');

router.get('/', (req, res) => {
  res.send({
    message: 'Router v1'
  });
})

router.use('/user', userRouter);
router.use('/role', roleRouter);
router.use('/product-category', productCategoryRouter);
router.use('/product-brand', productBrandRouter);
router.use('/merchant', merchantRouter);
router.use('/product', productRouter);
router.use('/cart', cartRouter);
router.use('/voucher', voucherRouter);
router.use('/order', orderRouter);
router.use('/product-delivery', productDeliveriesRouter); // Added by frank
router.use('/product-assets', productAssetsRouter); // Added by frank
router.use('/user-address', userAddressRouter);
router.use('/reviews', reviewRouter);
router.use('/notification', notificationRouter);
router.use('/manufacturer', manufacturerRouter );
router.use('/point-setting', pointSettingRouter);
router.use('/daily-spin-control', dailySpinControlRouter);
router.use('/user-spinwheel', UserSpinWheelRouter);
router.use('/user-prize', userPrizeRouter);
router.use('/stats', StatsRouter);
router.use('/faq', faqRouter);
// router.use('/store-invest', StrInvestPointsRouter);

router.use('/push-notifications', pushNotificationRouter);
router.use('/email-notifications', emailNotificationRouter);
router.use('/banner', bannerRouter);
router.use('/prize-setting', prizeSettingRouter);
router.use('/spinwheel-setting', spinwheelSettingRouter);
router.use('/user-points', userPointsRouter);
router.use('/shipping-details', shippingDetailsRouter);
router.use('/billing-details', billingDetailsRouter);
router.use('/overview', overviewRouter);

// Delivery routes
router.use('/delivery', DeliveryRoutes);
router.use('/webhook', WebhookRoutes);

router.use('/settings', SettingsRoutes);
router.use('/schedule-calls', ScheduleCallRoutes);
router.use('/popup-settings', PopupSettingsRoutes);
router.use('/news-notifications', NewsNotifications);
router.use('/events', EventRoutes);
router.use('/event-items', EventItemRoutes);

router.use('/industries', MerchantIndustriesRoutes);

module.exports = router;
