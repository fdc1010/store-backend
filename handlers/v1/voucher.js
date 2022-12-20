const {Op} = require('sequelize');
const VoucherValidator = require('../../validators/voucher');
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination');

class VoucherHandler {
  async getAllVoucher(req, res) {
    const {status, keyword} = req.query;
    let clause = {where: {}};
    if (keyword) clause = {
      where: {
        [Op.or]: [
          {
            name: {[Op.like]: `%${keyword}%`}
          },
          {
            code: {[Op.like]: `%${keyword}%`}
          },
        ]
      }
    }

    if (status && [0, 1].includes(parseInt(status))) clause.where.status = status;
    return await Pagination.paging(req, res, db.models.vouchers, clause);
  }

  async getUserVoucher(req, res) {
    const clause = {
      where: {
        user_id: req.user.id,
        amount: {
          [Op.gt]: 0
        }
      },
    }

    const include = ['voucher'];

    return await Pagination.paging(req, res, db.models.user_vouchers, clause, include);
  }

  async addVoucher(req, res) {
    const validator = await VoucherValidator.validateAddVoucher(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const voucher = await db.models.vouchers
      .create(formData);

    return BaseResponse.Success(res, 'Voucher created successfully', {voucher});
  }

  async updateVoucher(req, res) {
    const validator = await VoucherValidator.validateUpdateVoucher(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const voucher = await db.models.vouchers
      .update(formData, {
        where: {
          id: req.params.voucher_id
        }
      });

    return voucher[0] ? BaseResponse.Success(res, 'Voucher successfully updated') : BaseResponse.BadResponse(res, 'Voucher update failed');
  }

  async deleteVoucher(req, res) {
    const {voucher_id} = req.params;
    await db.models.vouchers
      .findOne({
        where: {
          id: voucher_id
        }
      })
  }

  async redeemVoucher(req, res) {
    let transaction = null;
    try {
      const validator = await VoucherValidator.validateRedeemVoucher(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;

      const { code, emails } = formData;

      if (!emails.length) {
        return BaseResponse.BadResponse(res, 'empty array.');
      }

      const voucher = await db.models.vouchers.findOne({
        where: {
          code,
        }
      });

      if (!voucher) return BaseResponse.BadResponse(res, 'Voucher not found');
      if (voucher.quantity === 0) return BaseResponse.BadResponse(res, 'Voucher out of stock');

      if (voucher.quantity < emails.length) return BaseResponse.BadResponse(res, 'Voucher quantity is not enough.');

      transaction = await db.transaction();
      voucher.quantity -= emails.length;
      await voucher.save({transaction});

      const users = await db.models.users.findAll({
        where: {
          email: {
            [Op.in]: emails
          }
        }
      });

      const userVouchers = users.map(u => {
        const data = {
          user_id: u.id,
          voucher_id: voucher.id,
          amount: 1
        }

        return data;
      });

      const createdUserVouchers = await db.models.user_vouchers.bulkCreate(
        userVouchers,
        {
          transaction,
          returning: true,
        }
      );

      await transaction.commit();

      return BaseResponse.Success(res, 'Voucher redeem successfully', { data: createdUserVouchers });
    } catch (err) {
      console.log('redeem err: ', err);
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
    
  }

  async applyGlobalVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const merchants = await db.models.merchants.findAll({
        attributes: ['id', 'user_id'],
      });

      const merchantUserId = merchants.map(item => item.user_id);
      const users = await db.models.users.findAll({
        where: {
          id: {
            [Op.notIn]: merchantUserId,
          }
        }
      });

      const userIds = users.map(u => u.id);
      const userVoucherData = userIds.map(userId => {
        return {
          user_id: userId,
          voucher_id: id,
          amount: 1,
        }
      });

      const userVouchers = await db.models.user_vouchers.bulkCreate(userVoucherData);

      return BaseResponse.Success(res, 'Apply golbal voucher', { data: userVouchers });
    } catch (err) {
      console.log('apply gobal voucher err: ', err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateVoucherTrigger(req, res, next) {
    try {
      const { id } = req.params;
      const { trigger } = req.body;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const voucher = await db.models.vouchers.findOne({
        where: {
          id
        }
      });

      if (!voucher) {
        return BaseResponse.BadResponse(res, 'Not found.');
      }

      voucher.trigger = trigger;
      await voucher.save();

      return BaseResponse.Success(res, 'Update success', { data: voucher });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async userRedeemVoucher(req, res, next) {
    let transaction = null;
    try {
      const { user } = req;
      const { id } = req.params;
      
      const voucher = await db.models.vouchers.findOne({
        where: { id }
      });

      if (!voucher) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const { quantity, redeem_count } = voucher;
      if (redeem_count >= quantity) {
        return BaseResponse.BadResponse(res, 'Out of voucher for giving');
      }

      const userVoucher = await db.models.user_vouchers.findOne({
        where: {
          user_id: user.id,
          voucher_id: id,
        }
      });

      if (userVoucher) {
        return BaseResponse.BadResponse(res, "You've redeemed this voucher.");
      }

      transaction = await db.transaction();

      const createdUserVoucher = await db.models.user_vouchers.create({
        user_id: user.id,
        voucher_id: id,
        amount: 1,
      }, {
        transaction,
      });

      voucher.redeem_count++;
      await voucher.save({transaction});

      await transaction.commit();

      return BaseResponse.Success(res, 'Redeem voucher successfully.', { data: { voucher, userVoucher: createdUserVoucher }});

    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async adminGetVoucherDetails(req, res, next) {
    try {
      const { id } = req.params;
      const voucher = await db.models.vouchers.findOne({
        where: { id }
      });

      if (!voucher) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      return BaseResponse.Success(res, 'Get voucher successfully.', { data: voucher });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new VoucherHandler;
