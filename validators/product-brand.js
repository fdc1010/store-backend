const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class ProductBrandValidator extends CustomValidator {
  validateAddProductBrand(req) {
    const Schema = Joi.object({
      name: Joi.string()
        .required(),

      description: Joi.string()
        .required()
    });

    return this.validateSchema(Schema, req);
  }

  validateUpdateProductBrand(req) {
    return this.validateAddProductBrand(req);
  }
}

module.exports = new ProductBrandValidator;
