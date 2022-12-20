const Joi = require('joi');

const CustomValidator = require('./custom-validator');

class StatsRequestValidator extends CustomValidator {

  validateSchema(Schema, data) {
    const validate = Schema.validate(data);
    if (validate.error) {
      return {
        success: false,
        message: validate.error.message,
        error: validate.error.details
      };
    }

    return {
      success: true,
      data: validate.value
    };
  }

  validateSummaryOrders(data) {
    const Schema = Joi.object({
      start_date: Joi.date().required(),
      end_date: Joi.date().required(),
      status: Joi.number().optional().valid(0,1,2,3,4,5),
    });

    return this.validateSchema(Schema, data);
  }
}

module.exports = new StatsRequestValidator();
