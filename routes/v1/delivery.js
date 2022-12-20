const router = require('express').Router();
const DeliveryHandler = require('../../handlers/v1/delivery');

const {authMiddleware} = require('../../middlewares/auth');

router.post('/quotations', DeliveryHandler.getQuotation);
router.post('/place-order', DeliveryHandler.placeOrder);

router.put('/orders/:id/cancel', DeliveryHandler.cancelOrder);

router.get('/orders/:orderRef/drivers/:driverId/location', DeliveryHandler.getDriverLocation);
router.get('/orders/:orderRef/drivers/:driverId', DeliveryHandler.getDriverDetails);
router.get('/orders/:id', DeliveryHandler.getOrderDetails);

module.exports = router;
