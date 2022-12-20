const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class SettingsValidator extends CustomValidator {
  constructor() {
    super();

    this.newSettingSchema = Joi.object({
      name: Joi.string()
        .max(32)
        .required(),
      type: Joi.number()
        .required(),
      values: Joi.any()
        .required(),
      target_id: Joi.number()
        .optional(),
      note: Joi.string()
        .optional(),
    });

    this.updateSettingSchema = this.newSettingSchema.keys({
      id: Joi.number()
        .required(),
    });
  }
  validateAddSetting(req) {
    return this.validateSchema(this.newSettingSchema, req);
  }

  validateUpdateSetting(req) {
    return this.validateSchema(this.updateSettingSchema, req);
  }
}

module.exports = new SettingsValidator();
