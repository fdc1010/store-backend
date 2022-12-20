const Joi = require('joi');
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');

class VoucherValidator extends CustomValidator {
  validateAddVoucher(req) {
    const checkCode = async (code, ctx) => {
      const voucher = await db.models.vouchers.findOne({
        where: {
          code: code
        }
      })

      if (voucher) {
        throw new Joi.ValidationError('Code already registered', [{
          message: `code "${code}" already exists`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const Schema = Joi.object({
      name: Joi.string()
        .required(),

      description: Joi.string()
        .required(),

      product_id: Joi.number()
        .default(null),

      category_id: Joi.number()
        .default(null),

      brand_id: Joi.number()
        .default(null),

      code: Joi.string()
        .alphanum()
        .uppercase()
        .external(checkCode),

      type: Joi.number()
        .required()
        .valid(0, 1),

      minimum_purchase: Joi.number()
        .min(0)
        .optional()
        .allow(null, ''),

      quantity: Joi.number()
        .min(0)
        .required(),

      amount: Joi.number()
        .required()
        .min(0),

      status: Joi.number()
        .required()
        .valid(0, 1)
        .default(1),
      
      start_date: Joi.date()
        .optional(),

      end_date: Joi.date()
        .optional(),
    });

    return this.validateSchemaAsync(Schema, req);
  }

  async validateUpdateVoucher(req) {
    const check = await db.models.vouchers.findOne({
      where: {
        id: req.params.voucher_id
      },
      raw: true
    })

    if (!check) return {
      success: false,
      message: 'Voucher not found'
    }

    const Schema = Joi.object({
      name: Joi.string()
        .required(),

      description: Joi.string()
        .required(),

      product_id: Joi.number()
        .default(null),

      category_id: Joi.number()
        .default(null),

      brand_id: Joi.number()
        .default(null),

      type: Joi.number()
        .required()
        .valid(0, 1),

      minimum_purchase: Joi.number()
        .min(0)
        .optional()
        .allow(null, ''),

      quantity: Joi.number()
        .min(0)
        .required(),

      amount: Joi.number()
        .required()
        .min(0),

      status: Joi.number()
        .required()
        .valid(0, 1)
        .default(1),

      start_date: Joi.date()
        .optional(),

      end_date: Joi.date()
        .optional(),
      
      trigger: Joi.number()
        .optional()
        .allow(null, ''),
    });

    return this.validateSchemaAsync(Schema, req);
  }

  validateRedeemVoucher(req) {
    const Schema = Joi.object({
      code: Joi.string()
        .required(),
      emails: Joi.array()
        .items(Joi.string())
        .required(),
    });

    return this.validateSchema(Schema, req);
  }
}

module.exports = new VoucherValidator;
