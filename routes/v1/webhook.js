const router = require('express').Router();
const LalamoveWebhookHandler = require('../../handlers/v1/lalamove.webhook');
const QxpressWebhookHandler = require('../../handlers/v1/qxpress.webhook');
const JTExpressWebhookHanlder = require('../../handlers/v1/jtxpress.webhook');

const {authMiddleware} = require('../../middlewares/auth');

router.post('/lalamove', (req, res, next) => LalamoveWebhookHandler.receiveHook(req, res, next));
// router.post('/qxpress', (req, res, next) => QxpressWebhookHandler.receiveHook(req, res, next));
router.post('/delivery/jtexpress', (req, res, next) => JTExpressWebhookHanlder.receiveHook(req, res, next));

module.exports = router;
