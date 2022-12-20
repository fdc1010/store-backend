const express = require('express');
const router = express.Router();
const Handler = require('../../handlers/v1/schedule-call');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.use(authMiddleware);
router.get('/', roleMiddleware('superadmin'), (req, res, next) => Handler.getScheduleCall(req, res, next) );
router.post('/', (req, res, next) => Handler.createScheduleCall(req, res, next) );
router.put('/:id', roleMiddleware('merchant'), (req, res, next) => Handler.updateScheduleCall(req, res, next) );

module.exports = router;
