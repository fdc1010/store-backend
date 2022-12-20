const express = require('express');
const router = express.Router();
const ProductBrandHandler = require('../../handlers/v1/product-brand');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

// router.use(authMiddleware);
// router.use(roleMiddleware('superadmin', 'merchant'));
router.post('/add', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductBrandHandler.addProductBrand);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductBrandHandler.updateProductBrand);
router.delete('/delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductBrandHandler.deleteProductBrand);
router.delete('/soft-delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductBrandHandler.softDeleteProductBrand);

router.get('/list', ProductBrandHandler.getAllProductBrand);
router.get('/view', ProductBrandHandler.getProductBrand);

module.exports = router;
