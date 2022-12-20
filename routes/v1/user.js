const express = require('express');
const router = express.Router();
const UserHandler = require('../../handlers/v1/user');
const path = require('path');

const {authMiddleware, roleMiddleware, queryAuthMiddleware} = require('../../middlewares/auth');

router.post('/register', UserHandler.register);
router.post('/register-invest', authMiddleware, roleMiddleware('superadmin'), UserHandler.createUserViaInvestEmail);
router.post('/login', UserHandler.login);
router.post('/login/invest', UserHandler.loginInvest); // Not used anymore
router.post('/login/superadmin', UserHandler.loginSuperadmin);
router.post('/login/invest-token', UserHandler.loginByInvestToken);

router.get('/profile', authMiddleware, UserHandler.getProfile);

router.patch('/profile/name', authMiddleware, UserHandler.updateName);
router.patch('/profile/gender', authMiddleware, UserHandler.updateGender);
router.patch('/profile/phone', authMiddleware, UserHandler.updatePhone);
router.patch('/profile/password', authMiddleware, UserHandler.updatePassword);
router.patch('/profile/avatar', authMiddleware, UserHandler.updateAvatar);
router.patch('/profile/birth-date', authMiddleware, UserHandler.updateBirthDate);
router.patch('/profile/default-address', authMiddleware, UserHandler.setDefaultAddress);

router.get('/admin/list', authMiddleware, roleMiddleware('superadmin'), UserHandler.getUserList);
router.post('/admin/create', authMiddleware, roleMiddleware('superadmin'), UserHandler.createUser);
router.post('/admin/delete', authMiddleware, roleMiddleware('superadmin','member'), UserHandler.deleteUserAlt);
router.delete('/admin/:user_id/delete', authMiddleware, roleMiddleware('superadmin'), UserHandler.deleteUser);
router.patch('/admin/:user_id', authMiddleware, roleMiddleware('superadmin', 'merchant'), UserHandler.updateUser);
router.get('/admin/export', queryAuthMiddleware, roleMiddleware('superadmin'), UserHandler.exportUser);

router.put('/admin/add-points', authMiddleware, roleMiddleware('superadmin'), UserHandler.addPoints);

router.get('/my-schedule-calls', authMiddleware, UserHandler.getMyScheduleCalls);

// script added by frank
router.post('/forgot-password', UserHandler.forgotPassword);
router.post('/change-password', UserHandler.resetPassword);
router.post('/login-role-check', UserHandler.loginRoleCheck);
// =====================


module.exports = router;
