"use strict";

const express = require('express');
const router = express.Router();
const ReviewsHandler = require('../../handlers/v1/reviews');

const {authMiddleware, optionalAuthMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/list', optionalAuthMiddleware, ReviewsHandler.getProductReviews);
router.get('/list-by-order-items', optionalAuthMiddleware, ReviewsHandler.listReviewOrderItems);
router.get('/list-by-order-id', authMiddleware, roleMiddleware('superadmin','merchant','member'), ReviewsHandler.getProductReviewsListByOrderId);
router.get('/list-by-id', authMiddleware, roleMiddleware('superadmin','merchant','member'), ReviewsHandler.getReviewsListByOrderId);
router.post('/add', authMiddleware, ReviewsHandler.addProductReview);
router.delete('/:id/assets/:assetId', authMiddleware, ReviewsHandler.removeAsset);
router.put('/:id', authMiddleware, ReviewsHandler.editReview);
router.get('/:id', optionalAuthMiddleware, ReviewsHandler.getReviewDetails);
module.exports = router;
