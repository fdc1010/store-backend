"use strict";
const express = require('express');
const router = express.Router();
const UserAddressHandler = require('../../handlers/v1/user-address');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/listAll', authMiddleware, roleMiddleware('superadmin'), UserAddressHandler.getAllAddresses);
router.post('/add', authMiddleware, UserAddressHandler.addUserAddress);
router.patch('/edit', authMiddleware, UserAddressHandler.updateUserAddress)
router.get('/view', authMiddleware, UserAddressHandler.getUserAddress);
router.get('/list', authMiddleware, UserAddressHandler.findUserAddress);
router.delete('/delete', authMiddleware, UserAddressHandler.deleteUserAddress);

module.exports = router;