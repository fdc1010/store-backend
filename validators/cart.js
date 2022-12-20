const Joi = require('joi');
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');

class RoleValidator extends CustomValidator {
  validateGetCart(req) {
    let sessionValidation = null;
    if (req.user) {
      sessionValidation = Joi.string()
    } else {
      sessionValidation = Joi.string().required()
    }
    
    const Schema = Joi.object({
      session_id: sessionValidation,
      use_point: Joi.string()
    })

    return this.validateSchemaOnQuery(Schema, req);
  }

  validateAddToCart(req) {
    const checkProduct = async (product_id, ctx) => {
      const product = await db.models.products.findOne({
        where: {
          id: product_id
        }
      })

      if (!product) {
        throw new Joi.ValidationError('Product not found', [{
          message: `Product not found`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const Schema = Joi.object({
      session_id: Joi.string()
        .required(),

      product_id: Joi.number()
        .required()
        .external(checkProduct),

      quantity: Joi.number()
        .required()
        .min(0),

      variant: Joi.string()
        .optional()
        .messages({
          'string.pattern.base': 'Please choose variation.',
          'string.empty': "Please choose variation.",
        }),

      is_update: Joi.boolean()
        .default(false),
      event_id: Joi.number()
        .optional()
        .allow(null, ''),
    });

    return this.validateSchemaAsync(Schema, req);
  }

  validateRemoveProductFromCart(req) {
    const checkProduct = async (product_id, ctx) => {
      const product = await db.models.products.findOne({
        where: {
          id: product_id
        }
      })

      if (!product) {
        throw new Joi.ValidationError('Product not found', [{
          message: `Product not found`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const Schema = Joi.object({
      session_id: Joi.string()
        .optional(),

      product_id: Joi.number()
        .required()
        .external(checkProduct),
      
      variant: Joi.string()
        .optional()
        .messages({
          'string.pattern.base': 'Please choose variation.',
          'string.empty': "Please choose variation.",
        }),
    });

    return this.validateSchemaAsync(Schema, req);
  }

  async validateApplyVoucher(req) {
    const Schema = Joi.object({
      voucher_id: Joi.number()
        .required(),
      user_voucher_id: Joi.number().required(),
    });

    return this.validateSchema(Schema, req);
  }

  async validateChangeAddress(req) {
    const checkAddress = async (address_id, ctx) => {
      const address = await db.models.user_addresses.findOne({
        where: {
          id: address_id
        }
      })

      if (!address) {
        throw new Joi.ValidationError('Address not found', [{
          message: `Address not found`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const Schema = Joi.object({
      address_id: Joi.number()
        .required()
        .external(checkAddress),
    });

    return this.validateSchemaAsync(Schema, req);
  }
  
  async validateUpdateFoodOrderDeliveryTime(req) {
    const Schema = Joi.object({
      cart_item_id: Joi.number()
        .required(),
      
      time: Joi.date()
        .required()
    })
    
    return this.validateSchema(Schema, req);
  }
}

module.exports = new RoleValidator;
