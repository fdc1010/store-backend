const express = require('express');
const router = express.Router();
const ProductAssetsHandler = require('../../handlers/v1/product-assets');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

// router.use(authMiddleware);
// router.use(roleMiddleware('superadmin', 'merchant'));
router.post('/add', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductAssetsHandler.addProductAsset);
router.patch('/edit', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductAssetsHandler.updateProductAsset);
router.delete('/delete', authMiddleware, roleMiddleware('superadmin', 'merchant'), ProductAssetsHandler.deleteProductAsset);


module.exports = router;
