"use strict";

const Joi = require('joi'),
    CustomValidator = require('./custom-validator');

class ManufacturerValidator  extends CustomValidator {
    validateAddManufacturer(req) {
        const Schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string()
        });
        return this.validateSchema(Schema, req);
    }

    validateUpdateManufacturer(req) {
        return this.validateAddManufacturer(req);
    }
}

module.exports = new ManufacturerValidator;