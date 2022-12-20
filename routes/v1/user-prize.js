"use strict";
const express = require('express');
const router = express.Router();
const UserPrizeHandler = require('../../handlers/v1/user-prize');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', authMiddleware, roleMiddleware('superadmin'), UserPrizeHandler.getAllUserPrize);
router.post('/add', authMiddleware, roleMiddleware('superadmin'), UserPrizeHandler.addUserPrize);
router.patch('/claimed', authMiddleware, roleMiddleware('superadmin'), UserPrizeHandler.claimedPrize);
router.patch('/redeemed', authMiddleware, roleMiddleware('superadmin'), UserPrizeHandler.redeemedPrize);
router.patch('/expired', authMiddleware, roleMiddleware('superadmin'), UserPrizeHandler.expiredPrize);
router.patch('/forfeited', authMiddleware, roleMiddleware('superadmin'), UserPrizeHandler.forfeitedPrize);

module.exports = router;