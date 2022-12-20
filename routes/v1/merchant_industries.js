const express = require('express');
const router = express.Router();
const MerchantIndustriesHandler = require('../../handlers/v1/merchant_industries');

const {authMiddleware, roleMiddleware, optionalAuthMiddleware} = require('../../middlewares/auth');

router.get('/', optionalAuthMiddleware, (req, res, next) => MerchantIndustriesHandler.getMerchantIndustries(req, res, next));
router.post('/', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => MerchantIndustriesHandler.createMerchantIndustry(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => MerchantIndustriesHandler.updateMerchantIndustry(req, res, next));
router.delete('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => MerchantIndustriesHandler.deleteMerchantIndustry(req, res, next));
router.get('/:id', authMiddleware, roleMiddleware('superadmin'), (req, res, next) => MerchantIndustriesHandler.getIndustry(req, res, next));


module.exports = router;
