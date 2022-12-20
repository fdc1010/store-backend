const router = require('express').Router();
const SettingsHandler = require('../../handlers/v1/settings');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/', authMiddleware, roleMiddleware('superadmin'), async (req, res, next) => await SettingsHandler.getSettings(req, res, next));
router.post('/', authMiddleware, roleMiddleware('superadmin'), async (req, res, next) => await SettingsHandler.createSettings(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('superadmin'), async (req, res, next) => await SettingsHandler.updateSetting(req, res, next));


module.exports = router;
