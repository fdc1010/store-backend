"use strict";

const express = require('express');
const router = express.Router();
const PopupSettingHandler = require('../../handlers/v1/popup-settings');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => PopupSettingHandler.getPopupSettings(req, res, next));
router.post('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => PopupSettingHandler.createPopupSetting(req, res, next));
router.put('/:id/change-status', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => PopupSettingHandler.changeStatus(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => PopupSettingHandler.updatePopupSetting(req, res, next));
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => PopupSettingHandler.removePopupSetting(req, res, next));

router.get('/active', (req, res, next) => PopupSettingHandler.getActivePopup(req, res, next));

router.get('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => PopupSettingHandler.getPopupSetting(req, res, next));

module.exports = router;
