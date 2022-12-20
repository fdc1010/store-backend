const express = require('express');
const router = express.Router();
const PushNotificationHandler = require('../../handlers/v1/push-notifications');

const {authMiddleware} = require('../../middlewares/auth');

// router.post('/add', PushNotificationHandler.addPushNotification);
router.get('/view', authMiddleware, PushNotificationHandler.getPushNotification);
router.patch('/edit', authMiddleware, PushNotificationHandler.updatePushNotification);

module.exports = router;

