const express = require('express');
const router = express.Router();
const CartHandler = require('../../handlers/v1/cart');

const {authMiddleware, roleMiddleware, optionalAuthMiddleware} = require('../../middlewares/auth');

router.use(optionalAuthMiddleware);
router.delete('/clear', CartHandler.clearCart);
router.get('/get', CartHandler.getCart);
router.post('/add', CartHandler.addProductToCart);
router.delete('/remove', CartHandler.removeProductFromCart);
router.post('/apply-voucher', authMiddleware, CartHandler.applyVoucher);
router.post('/remove-voucher', authMiddleware, CartHandler.removeVoucher);

router.post('/update-delivery-time', authMiddleware, CartHandler.updateFoodOrderDeliveryTime);

router.put('/change-address', authMiddleware, CartHandler.changeAddress);

module.exports = router;
