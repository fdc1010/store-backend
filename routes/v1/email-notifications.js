const express = require('express');
const router = express.Router();
const EmailNotificationHandler = require('../../handlers/v1/email-notifications');

const {authMiddleware} = require('../../middlewares/auth');

router.get('/view', authMiddleware, EmailNotificationHandler.getEmailNotification);
router.patch('/edit', authMiddleware, EmailNotificationHandler.updateEmailNotification);

module.exports = router;

