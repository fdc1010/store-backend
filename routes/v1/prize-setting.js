const express = require('express');
const router = express.Router();
const PrizeSettingHandler = require('../../handlers/v1/prize-setting');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, roleMiddleware('superadmin'), PrizeSettingHandler.getAllPrizeSetting);
router.get('/:id', authMiddleware, roleMiddleware('superadmin'), PrizeSettingHandler.getPrizeSetting);
router.post('/add', authMiddleware, roleMiddleware('superadmin'), PrizeSettingHandler.addPrizeSetting);
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), PrizeSettingHandler.updatePrizeSetting);
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), PrizeSettingHandler.deletePrizeSetting);

module.exports = router;
