const Joi = require('joi');

const CustomValidator = require('./custom-validator');

class NewsNotificationValidator extends CustomValidator {
  constructor() {
    super();

    this.newNewsNotificationSchema = Joi.object({
      title: Joi.string()
        .max(32)
        .required(),
      content: Joi.string()
        .required(),
      status: Joi.number()
        .optional()
        .allow(null, ''),
      type: Joi.number()
        .required(),
    });

    this.updateNewsNotificationSchema = this.newNewsNotificationSchema.keys({
      id: Joi.number()
        .required(),
    });
  }

  validateAdd(req) {
    return this.validateSchema(this.newNewsNotificationSchema, req);
  }

  validateUpdate(req) {
    return this.validateSchema(this.updateNewsNotificationSchema, req);
  }
}

module.exports = new NewsNotificationValidator();
