const express = require('express');
const router = express.Router();
const RoleHandler = require('../../handlers/v1/role');

const {authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.use(authMiddleware);
router.use(roleMiddleware('superadmin'));
router.get('/list', RoleHandler.getRoles);
router.post('/add', RoleHandler.addRole);
router.patch('/:roleId/update', RoleHandler.updateRoles);

module.exports = router;
