const express = require('express');
const router = express.Router();
const UserSpinWheelHandler = require('../../handlers/v1/user-spinwheel');

const {optionalAuthMiddleware, authMiddleware, roleMiddleware} = require('../../middlewares/auth');

router.get('/game', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), UserSpinWheelHandler.spinAWheel);
router.get('/game-by-user-id', UserSpinWheelHandler.spinAWheelByUserId);
router.get('/view-by-user-id', UserSpinWheelHandler.viewUserSpinAWheel);

router.get('/list', UserSpinWheelHandler.listUserSpinAWheel);

router.delete('/delete', optionalAuthMiddleware, UserSpinWheelHandler.deleteUserSpinWheel);

router.get('/view-turns-by-user-id', UserSpinWheelHandler.viewUserSpinAWheelTurnsByUserId);
router.get('/view-turns', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), UserSpinWheelHandler.viewUserSpinAWheelTurns);

router.post('/add-user-spin', authMiddleware, roleMiddleware('superadmin', 'merchant','member'), UserSpinWheelHandler.addUserSpinWheelResult);

module.exports = router;
