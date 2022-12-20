const express = require('express');
const router = express.Router();
const VoucherHandler = require('../../handlers/v1/voucher');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

// router.use(roleMiddleware('superadmin', 'merchant'));
router.get('/list', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.getAllVoucher);
router.post('/add', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.addVoucher);
router.get('/admin/:id', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.adminGetVoucherDetails);
router.patch('/:voucher_id/update', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.updateVoucher);
router.delete('/:voucher_id/delete', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.deleteVoucher);
router.post('/redeem', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.redeemVoucher);
router.get('/my-voucher', authMiddleware, VoucherHandler.getUserVoucher);

router.put('/:id/trigger', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.updateVoucherTrigger);
router.post('/:id/apply-global-voucher', authMiddleware, roleMiddleware('superadmin'), VoucherHandler.applyGlobalVoucher);
router.post('/:id/redeem', authMiddleware, VoucherHandler.userRedeemVoucher);


module.exports = router;
