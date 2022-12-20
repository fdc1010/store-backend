const Joi = require('joi');
const {Op} = require('sequelize');
const {ValidationError} = require('joi');
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');


class ProductCategoryValidator extends CustomValidator {
  constructor() {
    super();
  }

  async validateSchemaAsync(Schema, req, files = undefined) {
    try {
      if (req.query.product_category_id) {
        req.body.id = req.query.product_category_id;
      }
      const validate = await Schema.validateAsync(req.body);
      if (validate.error) {
        return {
          success: false,
          message: validate.error.message,
          error: validate.error.details
        };
      }
      
      return {
        success: true,
        data: validate
      };
    } catch (e) {
      return {
        success: false,
        message: e.message,
        error: e.details ? (e.details[0] ? e.details[0]: '') : ''
      }
    }
  }

  async validateAddProductCategory(req) {
    const checkCatName = async (data, ctx) => {
      const {name} = data;
      const category = await db.models.product_categories.findOne({
        where: {
          name,
        }
      });
      
      if (category) {
        throw new ValidationError('Category Name is already exist!', [{
          message: `category name ${name} already exists`,
          type: 'string.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const Schema = Joi.object({
      merchant_id: Joi.number(),
      name: Joi.string()
        .required(),

      description: Joi.string()
        .required(),

      fee: Joi.number()
        .min(0)
        .max(100)
        .required()
    }).external(checkCatName);

    return this.validateSchemaAsync(Schema, req);
  }

  validateUpdateProductCategory(req) {
    const checkCatName = async (data, ctx) => {
      const {name, id} = data;
      const category = await db.models.product_categories.findOne({
        where: {
          name,
          id: {
            [Op.ne]: id,
          },
        }
      });
      
      if (category) {
        throw new ValidationError('Category Name is already exist!', [{
          message: `category name ${name} already exists`,
          type: 'string.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const Schema = Joi.object({
      merchant_id: Joi.number(),
      id: Joi.number().required(),
      name: Joi.string()
        .required(),

      description: Joi.string()
        .required(),

      fee: Joi.number()
        .min(0)
        .max(100)
        .required()
    }).external(checkCatName);

    return this.validateSchemaAsync(Schema, req);
  }
}

module.exports = new ProductCategoryValidator;
