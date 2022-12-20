const express = require('express');
const router = express.Router();
const BillingDetailsHandler = require('../../handlers/v1/billing-details');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, BillingDetailsHandler.getAllBillingDetails);
router.get('/view', authMiddleware, BillingDetailsHandler.getBillingDetails);
router.post('/add', authMiddleware, BillingDetailsHandler.addBillingDetails);
router.patch('/edit', authMiddleware, BillingDetailsHandler.updateBillingDetails);
router.delete('/delete', authMiddleware, BillingDetailsHandler.deleteBillingDetails);

module.exports = router;