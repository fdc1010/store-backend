const express = require('express');
const router = express.Router();
const ProductHandler = require('../../handlers/v1/product');

const {authMiddleware, optionalAuthMiddleware, roleMiddleware} = require('../../middlewares/auth');

// router.use(authMiddleware);

router.post('/add', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.addProduct);

router.patch('/edit', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.updateProduct);
router.put('/:id/video', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.uploadVideo);

router.post('/approve', authMiddleware, roleMiddleware('superadmin'), ProductHandler.approveProduct);
router.post('/reject', authMiddleware, roleMiddleware('superadmin'), ProductHandler.rejectProduct);
router.post('/set-status', authMiddleware, roleMiddleware('superadmin'), ProductHandler.setProductStatus);
router.post('/recommend', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), ProductHandler.recommendProduct);
router.post('/set-top', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), ProductHandler.setTopProduct);
router.post('/set-hot', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), ProductHandler.setHotProduct);
router.post('/set-popular', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), ProductHandler.setPopularProduct);
router.post('/set-new', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), ProductHandler.setNewProduct);
router.post('/set-recommend', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), ProductHandler.setRecommendProduct);

router.delete('/delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.deleteProduct);
router.delete('/soft-delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.softDeleteProduct);

router.get('/list-admin', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.getFilterProductListAdmin);
router.get('/list-admin-by-status', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductHandler.getFilterProductListAdmin);

router.post('/list', optionalAuthMiddleware, ProductHandler.getFilterProductList);
router.get('/view', optionalAuthMiddleware, ProductHandler.getProductView);

router.get('/merchant/list', ProductHandler.getAllMerchantProducts);
router.get('/merchant/list-by-category', optionalAuthMiddleware, ProductHandler.getAllMerchantProductsByCategory);

router.get('/recommended', ProductHandler.getRecommendedProducts);
router.get('/recommended/list', ProductHandler.getProductRecommendedList);
router.get('/hot/list', ProductHandler.getProductHotList);
router.get('/top/list', ProductHandler.getProductTopList);
router.get('/new/list', ProductHandler.getProductNewList);
router.get('/popular/list', ProductHandler.getProductPopularList);

router.get('/like/list', optionalAuthMiddleware, ProductHandler.getProductLikesList);
router.get('/like/list-by-user-id', authMiddleware, roleMiddleware('superadmin', 'merchant', 'member'), ProductHandler.getProductLikesListByUserId);

router.post('/like', authMiddleware, roleMiddleware('superadmin', 'merchant', 'member'), ProductHandler.likeProduct);

router.get('/:id/flash-deal-check', ProductHandler.checkProductInFlashDeal)
router.get('/:id/reviews', optionalAuthMiddleware, ProductHandler.getReviewsOfProductById);

module.exports = router;
