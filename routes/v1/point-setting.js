"use strict";

const express = require('express');
const router = express.Router();
const PointSettingHandler = require('../../handlers/v1/point-setting');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, PointSettingHandler.getAllPointSetting);
router.get('/view', authMiddleware, PointSettingHandler.getPointSetting);
router.post('/add', authMiddleware, PointSettingHandler.addPointSetting);
router.patch('/edit', authMiddleware, PointSettingHandler.updatePointSetting);
router.delete('/delete', authMiddleware, PointSettingHandler.deletePointSetting);

module.exports = router;