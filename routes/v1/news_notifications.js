"use strict";

const express = require('express');
const router = express.Router();
const NewsNotificationHandler = require('../../handlers/v1/news-notifications');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/', authMiddleware, (req, res, next) => NewsNotificationHandler.getNewsNotifications(req, res, next));
router.post('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => NewsNotificationHandler.createNewsNotification(req, res, next));
router.get('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => NewsNotificationHandler.getNewsNotification(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => NewsNotificationHandler.updateNewsNotification(req, res, next));
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => NewsNotificationHandler.removeNewsNotification(req, res, next));

module.exports = router;
