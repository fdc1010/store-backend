const express = require('express');
const router = express.Router();
const UserPointsHandler = require('../../handlers/v1/user-points');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');
const {StrInvestService} = require('../../middlewares/service');

router.get('/admin/list', authMiddleware, roleMiddleware('superadmin'), UserPointsHandler.getAllUserPointsAdmin);
router.get('/admin/view', authMiddleware, roleMiddleware('superadmin'), UserPointsHandler.getUserPointsAdmin);
router.post('/admin/add', authMiddleware, roleMiddleware('superadmin'), UserPointsHandler.addUserPointsAdmin);
router.post('/add', authMiddleware, UserPointsHandler.addUserPoints);

router.get('/logs', authMiddleware, UserPointsHandler.getUserPointsLog);

// service routes
router.post('/service/store-invest/add-points', StrInvestService, UserPointsHandler.serviceAddPointsFromInvest);


module.exports = router;
