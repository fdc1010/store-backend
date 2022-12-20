const db = require('../../configs/sequelize');
const ScheduleCallValidator = require('../../validators/schedule-call');

const { SCHEDULE_CALL_TYPES } = require('../../configs');

const ProductsService = require('../../services/products.service');
const ScheduleCallService = require('../../services/schedule-call.service');

const Pagination = require('../../utils/pagination');

class ScheduleCallHandler {
  async getScheduleCall(req, res) {
    try {
      const { status } = req.query;
      const user = req.user;
      const includes = [
        {
          as: 'user',
          model: db.models.users,
          attributes: ['name', 'email', 'contact_no', 'gender']
        },
        {
          as: 'merchant',
          model: db.models.merchants,
          attributes: ['name', 'office_phone_number']
        }
      ];

      const whereClause = {};
      if (status) {
        whereClause.status = status;
      }

      return Pagination.paging(
        req,
        res,
        db.models.schedule_calls,
        {
          where: {
            ...whereClause,
          },
        },
        includes
      );
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async createScheduleCall(req, res, next) {
    try {
      const validator = ScheduleCallValidator.validateAddScheduleCall(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const user = req.user;

      const formData = validator.data;
      const { product_id } = formData;
      const product = await ProductsService.findOne({
        where: {
          id: product_id,
        }
      });

      if (!product || !product.type || product.type === 1) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const productPrice = product.sell_price;
      const data = {
        ...formData,
        user_id: user.id,
        product_price: productPrice,
        product_info: product.toJSON(),
        status: 1,
      }

      const result = await ScheduleCallService.create({ data });

      ScheduleCallService.sendNewScheduleCallEmailToMerchant({
        merchantId: formData.merchant_id,
        data: result,
      });

      return BaseResponse.Success(res, 'Create schedule call success.', { data: result });

    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateScheduleCall(req, res, next) {
    try {
      const validator = ScheduleCallValidator.validateUpdateScheduleCall(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const { user } = req;
      const merchant = (user.merchants || [])[0];
      const { id } = req.params;
      const formData = validator.data;

      if (!merchant) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const scheduleCall = await ScheduleCallService.findOne({
        where: { id },
      });

      if (!scheduleCall || scheduleCall.merchant_id !== merchant.id) {
        return BaseResponse.BadRequest(res, 'Not found');
      }

      const updatedScheduleCall = await scheduleCall.update({ ...formData });

      return BaseResponse.Success(res, 'Update schedule call successfully.', { data: updatedScheduleCall });
    } catch (err) {
      return BaseResponse.BadResponse(req, err.message);
    }
  }
}

module.exports = new ScheduleCallHandler();
