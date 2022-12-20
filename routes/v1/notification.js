"use strict";

const express = require('express'),
router = express.Router(),
NotificationHandler = require('../../handlers/v1/notification');
// PushNotificationHandler = require('../../handlers/v1/push-notifications');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, NotificationHandler.getAllNotification);
router.get('/unread-count', authMiddleware, NotificationHandler.countUnread);
router.get('/detail/:id', authMiddleware, NotificationHandler.detailNotification);

router.patch('/read', authMiddleware, NotificationHandler.markAsRead);
router.delete('/delete', authMiddleware, NotificationHandler.deleteNotification);

router.get('/send-test-email-notif', NotificationHandler.testEmailNotif);
router.get('/send-test-notif', NotificationHandler.testNotif);
router.get('/send-test-notif-jsonstringify', NotificationHandler.testNotifJsonStringify);

router.post('/push-notification', authMiddleware, roleMiddleware('superadmin'), NotificationHandler.pushNotification)
router.put('/read-all', authMiddleware, NotificationHandler.readAllNotifications);

module.exports = router;
