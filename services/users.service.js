const {Op} = require('sequelize');
const db = require("../configs/sequelize");
const { VOUCHER_TRIGGER, BASE_URL } = require('../configs');
const EMAIL_TEMPLATES = require('../email-templates');
const EmailHelper = require('../utils/email-helper');

const moment = require('../configs/moment');
class UserService {
  constructor() {
    this.Model = db.models.users;
  }

  /**
   * 
   * @param {Object} user: New user join the system
   */
  async welcomeNewUser(user) {
    try {
      // Get welcome voucher from voucher table
      const welcomeVoucher = await db.models.vouchers.findOne({
        where: {
          status: 1,
          trigger: VOUCHER_TRIGGER.NEW_USER,
        }
      });

      if (!welcomeVoucher) {
        return;
      }

      // Create for new user an voucher with welcome voucher value (eg: $3)
      const userVoucher = {
        user_id: user.id,
        voucher_id: welcomeVoucher.id,
        amount: 1,
      }

      await db.models.user_vouchers.create(userVoucher);
      
      // Send and email welcome to user for letting they know they have a voucher as a welcome
      // TODO
      // Parse template when we get it.
      const htmlTemplate = EmailHelper.prepareTemplate({
        template: EMAIL_TEMPLATES.WELCOME_EMAIL,
        data: {
          base_url: BASE_URL,
        }
      })
      const sendEmailResponse = await EmailHelper.sendMail({
        email: user.email,
        subject: 'Welcome',
        template: htmlTemplate,
      });

      // TODO
      // Should log response of email sending
      // End send welcome email
    } catch(err) {
      // Should logg to file or system
      console.log('Send welcome email error: ', err);
    }
  }

  /**
   * 
   * @param {Object} user: New user join the system
   */
  async CNYTREATVoucher(user) {
    try {
      const now = moment();
      const registerEndDate = moment('2022-01-24T16:00:00Z');

      if (now.isSameOrAfter(registerEndDate)) {
        return;
      }

      const voucher = await db.models.vouchers.findOne({
        where: {
          code: 'CNYTREAT',
          status: 1,
        },
      });

      if (!voucher) {
        return;
      }

      if (voucher.quantity <= 0) {
        console.log('Voucher quantity is <= 0');
        return;
      }

      const userVoucher = {
        user_id: user.id,
        voucher_id: voucher.id,
        amount: 1,
      }

      await db.models.user_vouchers.create(userVoucher);
      const newQuantity = voucher.quantity - 1;
      voucher.quantity = newQuantity;
      await voucher.save();
    } catch (err) {
      console.log('CNYTREAT voucher for registere user err: ', err);
    }
  }

  /**
   * 
   * @param {Object} user: New user join the system
   */
  async applyGlobalVoucherForNewUser(user) {
    try {
      const now = moment();
      const availableVouchers = await db.models.vouchers.findAll({
        where: {
          trigger: VOUCHER_TRIGGER.GLOBAL_VOUCHER,
          start_date: {
            [Op.lte]: now.toDate(),
          },
          end_date: {
            [Op.gte]: now.toDate(),
          }
        }
      });

      const newUserVouchers = availableVouchers.map(item => {
        return {
          user_id: user.id,
          voucher_id: item.id,
          amount: 1,
        };
      });

      const createdUserVouchers = await db.models.user_vouchers.bulkCreate(newUserVouchers);
    } catch (err) {
      console.log('create global voucher for user error: ', err);
    }
  }

  async findAll({ where, ...options }) {
    return this.Model.findAll({
      where,
      ...options
    });
  }
}

module.exports = new UserService();
