const CronJob = require('cron').CronJob;
const JTExpressService = require('../services/jtexpress.service');

const JTExpressReLogin = async () => {
  try {
    const service = new JTExpressService();
    await service.getJTExpressAccessToken();
  } catch (err) {
    console.log('jtexpress cron jbo relogin err: ', err);
  }
}

const job = new CronJob(
	'00 00 01 * * mon',
  // '*/5 * * * * *',
	JTExpressReLogin,
	null,
	false,
	'Asia/Singapore'
);

module.exports = job;
