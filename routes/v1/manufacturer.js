"use strict";

const express = require('express');
const router = express.Router();
const ManufacturerHandler = require('../../handlers/v1/manufacturer');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.post('/add', authMiddleware, roleMiddleware('superadmin'), ManufacturerHandler.addManufacturer);
router.get('/list', authMiddleware, roleMiddleware('superadmin'), ManufacturerHandler.getAllManufacturers);
router.get('/view', authMiddleware, roleMiddleware('superadmin'), ManufacturerHandler.getManufacturer);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin'), ManufacturerHandler.updateManufacturer);
router.delete('/delete', authMiddleware, roleMiddleware('superadmin'), ManufacturerHandler.deleteManufacturer);

module.exports = router;