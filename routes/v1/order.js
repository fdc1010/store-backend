const express = require('express');
const router = express.Router();
const OrderHandler = require('../../handlers/v1/order');

const {authMiddleware, roleMiddleware, optionalAuthMiddleware, queryAuthMiddleware} = require('../../middlewares/auth');

// router.use(authMiddleware);
// router.use(roleMiddleware('superadmin', 'merchant'));
router.get('/settement', queryAuthMiddleware, roleMiddleware('superadmin'), OrderHandler.settementReport);
router.post('/checkout', authMiddleware, OrderHandler.checkout);
router.get('/list', authMiddleware, OrderHandler.list);
router.get('/order-items', authMiddleware, OrderHandler.listOrderItems);
router.get('/:id/waybill', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.printWaybill);
router.get('/:order_id/detail', authMiddleware, OrderHandler.detail);
router.post('/_webhook/hitpay', OrderHandler.hitpayWebhook);
router.post('/:order_id/refund', authMiddleware, OrderHandler.refund);
router.post('/:order_id/confirm-received', authMiddleware, OrderHandler.confirmOrder);
router.get('/tracking/:order_item_id', authMiddleware, OrderHandler.trackingDetail);
router.put('/:id/merchant-cancel', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.merchantCancelOrder);
router.put('/:id/processed', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.processedOrder);
router.put('/:id/shipped', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.setShippedOrder);


router.patch('/order-item/set-status', authMiddleware, roleMiddleware('superadmin'), OrderHandler.setOrderItemStatus);

router.get('/list-admin', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.getFilterOrderListAdmin);
router.get('/set-past', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.setOrderPast);
router.get('/set-completed', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.setOrderCompleted);

router.get('/export-order', queryAuthMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.exportOrder);

router.get('/download-courier-list', queryAuthMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.downloadListOfCourier);
router.get('/download-order-template', queryAuthMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.downloadOrderDeliveryTemplate);
router.post('/upload-order-delivery', authMiddleware, roleMiddleware('merchant'), OrderHandler.uploadOrderDelivery);
router.post('/update-delivery', OrderHandler.updateDeliveryWebhook);
router.get('/:order_id/detail-merchant', authMiddleware, roleMiddleware('merchant'), OrderHandler.detailMerchant)

router.post('/resolve-item-logs', OrderHandler.resolveOrderLogs);
// Update order status
// router.patch('/update/:order_id/delivered', authMiddleware, roleMiddleware('merchant'), Orderhandler.updateOrderToDelivered);

router.get('/:id/reviews', authMiddleware, roleMiddleware('superadmin', 'merchant'), OrderHandler.getOrderReviews)

router.get('/food/list', authMiddleware, OrderHandler.getFoodOrderList);

module.exports = router;
