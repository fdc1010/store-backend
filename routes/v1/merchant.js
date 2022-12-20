const express = require('express');
const router = express.Router();
const MerchantHandler = require('../../handlers/v1/merchant');

const {authMiddleware, roleMiddleware, optionalAuthMiddleware} = require('../../middlewares/auth');

router.post('/register', optionalAuthMiddleware, MerchantHandler.register);
router.get('/list', MerchantHandler.getAllMerchant);
router.get('/search', MerchantHandler.searchMerchant);
// filter merchant by keyword and field
router.get('/filter', MerchantHandler.filterMerchant);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin','merchant'), MerchantHandler.editMerchant);
router.get('/view', authMiddleware, roleMiddleware('superadmin','merchant'), MerchantHandler.getMerchantView);
router.patch('/verify/:merchant_id', authMiddleware, roleMiddleware('superadmin'), MerchantHandler.merchantVerification);
router.get('/color-settings', authMiddleware, roleMiddleware('superadmin','merchant'), MerchantHandler.getColorSettings);
router.get('/my-schedule-calls', authMiddleware, roleMiddleware('merchant'), MerchantHandler.getMyScheduleCalls);
router.get('/:id/schedule-calls', authMiddleware, roleMiddleware('superadmin'), MerchantHandler.getMerchantScheduleCalls);
router.get('/:id', optionalAuthMiddleware, MerchantHandler.getMerchant);

router.put('/settings', authMiddleware, roleMiddleware('merchant'), MerchantHandler.editSettings);

router.get('/reviews/:merchant_id', MerchantHandler.getMerchantReviews);
router.post('/reply-reviews/:product_review_id', authMiddleware, roleMiddleware('superadmin', 'merchant'), MerchantHandler.replyProductReview);
router.put('/:id/disable', authMiddleware, roleMiddleware('superadmin'), MerchantHandler.disableMerchant);
router.put('/:id/re-active', authMiddleware, roleMiddleware('superadmin'), MerchantHandler.activeMerchant);

module.exports = router;
