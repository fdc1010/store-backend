const express = require('express');
const router = express.Router();

const EventHandler = require('../../handlers/v1/events');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.post('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventHandler.createEvent(req, res, next));
router.get('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventHandler.getEvents(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventHandler.updateEvent(req, res, next));
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventHandler.removeEvent(req, res, next));

router.get('/flash-deal', (req, res, next) => EventHandler.getActiveFlashDeal(req, res, next));

router.get('/:id/items', (req, res, next) => EventHandler.getEventItems(req, res, next));
router.get('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => EventHandler.getEventById(req, res, next));

module.exports = router; 
