const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class ProductDeliveriesValidator extends CustomValidator {
  validateAddProductDeliveries(req) {
    const Schema = Joi.object({
      name: Joi.string()
        .required(),

      description: Joi.string()
        .required(),
        
      fee: Joi.number().min(0)
        .required()
    });

    return this.validateSchema(Schema, req);
  }

  validateUpdateProductDeliveries(req) {
    return this.validateAddProductDeliveries(req);
  }
}

module.exports = new ProductDeliveriesValidator;
