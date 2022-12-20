const express = require('express');
const router = express.Router();
const ProductCategoryHandler = require('../../handlers/v1/product-category');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

// router.use(authMiddleware);
// router.use(roleMiddleware('superadmin', 'merchant'));
// router.get('/list', ProductCategoryHandler.getAllProductCategory);
router.post('/add', authMiddleware, roleMiddleware('superadmin'), ProductCategoryHandler.addProductCategory);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin'), ProductCategoryHandler.updateProductCategory);
router.delete('/delete', authMiddleware, roleMiddleware('superadmin'), ProductCategoryHandler.deleteProductCategory);
router.delete('/soft-delete', authMiddleware, roleMiddleware('superadmin'), ProductCategoryHandler.softDeleteProductCategory);

router.post('/filter-list', ProductCategoryHandler.getFilterProductCategoryList);

router.get('/list', ProductCategoryHandler.getAllProductCategory);
router.get('/view', ProductCategoryHandler.getProductCategory);
router.get('/list-by-merchant', ProductCategoryHandler.getAllProductCategoryByMerchant);
router.get('/position', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductCategoryHandler.getCategoryPosition);
router.post('/position', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductCategoryHandler.updateCategoryPosition);
router.post('/resolve', ProductCategoryHandler.resolveProductCategory);

router.put('/:id/change-status', authMiddleware, roleMiddleware('superadmin'), ProductCategoryHandler.changeStatus);

module.exports = router;
