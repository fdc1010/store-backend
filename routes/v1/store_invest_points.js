"use strict";
/**
 * Developer: Abubakar Abdullahi
 * Date: 12/07/2021
 * Time: 2:07 PM
 */

const express = require('express');
const router = express.Router();
const StoreInvestPointsHandler = require('../../handlers/v1/store_invest_points');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/points', StoreInvestPointsHandler.getPointFromStrInvest);
router.post('/add', StoreInvestPointsHandler.savePointFrmStrInvest);
router.post('/save-point', StoreInvestPointsHandler.saveStrInvestPointToUserPoint);


module.exports = router;