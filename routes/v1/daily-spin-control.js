"use strict";
const express = require('express');
const router = express.Router();
const DailySpinControlHandler = require('../../handlers/v1/daily-spin-control');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.getAllDailySpinControl);
router.get('/:id', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.getDailySpinControl);
router.post('/add', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.addDailySpinControl);
router.put('/:id/active-spinwheel', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.activeSpinwheel);
router.put('/:id/change-status', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.changeStatus);
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.updateDailySpinControl);
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), DailySpinControlHandler.deleteDailySpinControl);

module.exports = router;
