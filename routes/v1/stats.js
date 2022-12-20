const express = require('express');
const router = express.Router();
const StatsHandler = require('../../handlers/v1/stats');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/info', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getInfo);
router.get('/info-by-user-id', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getInfoByUserId);
router.get('/orders-count', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getOrdersCount);
router.get('/revenues-total', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getTotalRevenues);
router.get('/daily-sales', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getDailySales);

router.get('/orders', authMiddleware, roleMiddleware('superadmin', 'merchant'), StatsHandler.summaryOrders);

// router.get('/orders', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getOrders);
// router.get('/sales', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getSales);
// router.get('/daily-sales', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getDailySales);
// router.get('/revenues', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), StatsHandler.getRevenues);

module.exports = router;
