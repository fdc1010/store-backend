const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class ScheduleCallsValidator extends CustomValidator {
  constructor() {
    super();

    this.newScheduleCallSchema = Joi.object({
      product_id: Joi.number()
        .required(),
      type: Joi.number()
        .required(),
      merchant_id: Joi.number()
        .required(),
      schedule_call: Joi.date()
        .required(),
      note: Joi.string()
        .allow(null, '')
        .optional(),
    });

    this.updateScheduleCallSchema = this.newScheduleCallSchema.keys({
      id: Joi.number()
        .required(),
      user_id: Joi.number()
        .required(),
      product_price: Joi.number()
        .optional(),
      status: Joi.number()
        .optional(),
      product_info: Joi.object()
        .optional(),
    });
  }
  validateAddScheduleCall(req) {
    return this.validateSchema(this.newScheduleCallSchema, req);
  }

  validateUpdateScheduleCall(req) {
    return this.validateSchema(this.updateScheduleCallSchema, req);
  }
}

module.exports = new ScheduleCallsValidator();
