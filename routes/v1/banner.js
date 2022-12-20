const router = require('express').Router();
const BannerHandler = require('../../handlers/v1/banner');

const {authMiddleware} = require('../../middlewares/auth');

router.get('/preview/list', BannerHandler.getPreviewBanner);

router.use(authMiddleware);
router.get('/list', BannerHandler.getAllBanner);
router.get('/view', BannerHandler.getBanner);
router.post('/add', BannerHandler.addBanner);
router.patch('/edit', BannerHandler.updateBanner);
router.delete('/delete', BannerHandler.deleteBanner);
router.put('/:id/status', BannerHandler.changeBannerStatus);

module.exports = router;
