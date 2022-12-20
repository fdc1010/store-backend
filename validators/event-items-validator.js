
"use strict";

const Joi = require('joi'),
CustomValidator = require('./custom-validator');

class EventItemsValidator extends CustomValidator {
  constructor() {
    super();

    this.eventItemsSchema = Joi.object({
      event_id: Joi.number()
        .required(),
      item_id: Joi.number()
        .required(),
      type: Joi.number()
        .required(),
      status: Joi.number()
        .optional()
        .allow(null, ''),
    });

    this.updateEventItemsSchema = this.eventItemsSchema.keys({
      id: Joi.number()
        .optional()
        .allow(null, ''),
    });
  }

  validateAdd(req) {
    return this.validateSchema(this.eventItemsSchema, req);
  }

  validateUpate(req) {
    return this.validateSchema(this.updateEventItemsSchema, req);
  }

}

module.exports = new EventItemsValidator();
