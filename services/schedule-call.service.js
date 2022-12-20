const {Op} = require('sequelize');

const db = require("../configs/sequelize");
const EmailService = require('../utils/email-helper');
const MerchantService = require('./merchant.service');

class ScheduleCallsService {
  constructor() {
    this.Model = db.models.schedule_calls;
  }

  async findAll({ where = {}, ...options}) {
    const defaultWhere = {
      status: 1,
    };

    return this.Model.findAll({
      where: {
        ...defaultWhere,
        ...where,
      },
      ...options
    });
  }

  async findOne({ where = {}, ...options }) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async create({ data, options }) {
    return this.Model.create({ ...data }, {...options});
  }

  async update(data, options) {
    return this.Model.update({ ...data }, { ...options });
  }

  async sendNewScheduleCallEmailToMerchant({merchantId, data}) {
    try {
      const merchant = await MerchantService.findOne({
        where: {
          id: merchantId,
        },
        include: ['user']
      });

      if (!merchant) {
        return;
      }
      const merchantUser = merchant.user;
      const email = merchantUser.email;
      if (!email) {
        console.log('merchant doesnt have email');
        return;
      }

      await EmailService.sendMail({
        email,
        subject: 'New sechedule call',
        template: 'You have new schedul call.',
      });
    } catch (err) {
      console.log('Send email new schedule call err: ', err);
    }
  }
}

module.exports = new ScheduleCallsService();
