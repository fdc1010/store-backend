const {Op} = require('sequelize');
const CronJob = require('cron').CronJob;

const { ROLES } = require('../configs');
const moment = require('../configs/moment');
const FcmHelper = require('../utils/fcm-helper');
const UserService = require('../services/users.service');

const broadcastSpinwheelResetNotification = async () => {
  try {
    console.log('Start broadcast spinwheel reset notification: ', moment().toString());
    const users = await UserService.findAll({
      where: {
        role_id: ROLES.USER,
      },
      include: [
        'email_notifications',
        'user_fcms',
      ],
    });

    const availableUsers = users.filter(u => u.email_notifications && u.email_notifications[0]?.status);
    const fcmTokens = availableUsers
      .reduce((results, u) => u.user_fcms && u.user_fcms.fcm_token ? [...results, u.user_fcms.fcm_token] : results, []);
    const fcmTokensSet = new Set(fcmTokens); 

    const title = 'Specially for you!';
    const message = 'Your daily wheel spin has been restored! Spin now!';

    const results = await FcmHelper.pushNotificationToMultipleDevices({
      userFcmTokens: [...fcmTokensSet],
      title,
      description: message,
      data: {},
    });
    console.log('END broadcast spinwheel reset notification');
  } catch (err) {
    console.log('broadcast spinwheel reset notification err: ', err);
  }
}

const job = new CronJob(
	'00 00 08 * * *',
  // '*/5 * * * * *',
	broadcastSpinwheelResetNotification,
	null,
	false,
	'Asia/Singapore'
);

module.exports = job;
