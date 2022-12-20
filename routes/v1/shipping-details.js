const express = require('express');
const router = express.Router();
const ShippingDetailsHandler = require('../../handlers/v1/shipping-details');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, ShippingDetailsHandler.getAllShippingDetails);
router.get('/view', authMiddleware, ShippingDetailsHandler.getShippingDetails);
router.post('/add', authMiddleware, ShippingDetailsHandler.addShippingDetails);
router.patch('/edit', authMiddleware, ShippingDetailsHandler.updateShippingDetails);
router.delete('/delete', authMiddleware, ShippingDetailsHandler.deleteShippingDetails);

module.exports = router;