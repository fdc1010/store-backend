"use strict";

const Joi = require('joi'),
CustomValidator = require('./custom-validator');

class EventsValidator extends CustomValidator {
  constructor() {
    super();

    const eventItemsSchema = Joi.object({
      item_id: Joi.number()
        .required(),
      type: Joi.number()
        .required(),
      status: Joi.number()
        .optional()
        .allow(null, ''),
    });

    const updateEventItemsSchema = eventItemsSchema.keys({
      id: Joi.number()
        .optional()
        .allow(null, ''),
    })

    this.createEventSchema = Joi.object({
      name: Joi.string()
        .required(),
      content: Joi.object()
        .required(),
      type: Joi.number()
        .required(),
      // event_items: Joi.array()
      //   .items(eventItemsSchema)
      //   .required(),
      start_date: Joi.date()
        .required(),
      end_date: Joi.date()
        .required(),
      status: Joi.number()
        .optional()
        .allow(null, ''),
    });

    this.updateEventSchema = this.createEventSchema.keys({
      id: Joi.number()
        .required(),
      // event_items: Joi.array()
      //   .items(updateEventItemsSchema)
      //   .required(),
    });
  }

  validateAdd(req) {
    return this.validateSchema(this.createEventSchema, req);
  }

  validateUpate(req) {
    return this.validateSchema(this.updateEventSchema, req);
  }

}

module.exports = new EventsValidator();
