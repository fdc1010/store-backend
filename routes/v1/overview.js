"use strict";

const express = require('express');
const router = express.Router();
const OverviewHandler = require('../../handlers/v1/overview');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');


router.get('/revenues-total', authMiddleware, roleMiddleware('superadmin', 'merchant'), OverviewHandler.getTotalSalesRevenue);
router.get('/orders-total', authMiddleware, roleMiddleware('superadmin', 'merchant'), OverviewHandler.getTotalNumberOrders);
router.get('/daily-sales-total', authMiddleware, roleMiddleware('superadmin', 'merchant'), OverviewHandler.getTotalDailySales);


module.exports = router;