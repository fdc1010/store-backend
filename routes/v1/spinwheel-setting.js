const express = require('express');
const router = express.Router();
const SpinwheelSettingHandler = require('../../handlers/v1/spinwheel-setting');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', SpinwheelSettingHandler.getDailySpinwheel);
router.get('/view', SpinwheelSettingHandler.getSpinwheelSetting);
router.post('/add', authMiddleware, roleMiddleware('superadmin'), SpinwheelSettingHandler.addSpinwheelSetting);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin'), SpinwheelSettingHandler.updateSpinwheelSetting);
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), SpinwheelSettingHandler.deleteSpinwheelSetting);

module.exports = router;
