const express = require('express');
const router = express.Router();

const EventItemHandler = require('../../handlers/v1/event_items');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.post('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventItemHandler.createEventItem(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventItemHandler.updateEventItem(req, res, next))
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventItemHandler.removeEventItem(req, res, next));

module.exports = router; 
