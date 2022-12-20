const express = require('express');
const router = express.Router();
const ProductDeliveriesHandler = require('../../handlers/v1/product-deliveries');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

// router.use(authMiddleware);
// router.use(roleMiddleware('superadmin', 'merchant'));
router.post('/add', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductDeliveriesHandler.addProductDeliveries);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductDeliveriesHandler.updateProductDeliveries);
router.delete('/delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductDeliveriesHandler.deleteProductDeliveries);
router.delete('/soft-delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductDeliveriesHandler.softDeleteProductDeliveries);

router.get('/list', ProductDeliveriesHandler.getAllProductDeliveries); // Added by frank
router.get('/view', ProductDeliveriesHandler.getProductDeliveries); // Added by frank

module.exports = router;
