"use strict";

const Joi = require('joi'),
    CustomValidator = require('./custom-validator');

class UserAddressValidator extends CustomValidator {
    validateAddUserAddress(req) {
        const Schema = Joi.object({
            label: Joi.string().required(),
            full_address: Joi.string().optional(),
            street_name: Joi.string().required(),
            block_no: Joi.string().allow(null, ''),
            unit_no: Joi.string().allow(null, ''),
            building_name: Joi.string().allow(null, ''),
            postal_code: Joi.string().required(),
            latitude: Joi.string().required(),
            longitude: Joi.string().required(),
        });
        return this.validateSchema(Schema, req);
    }

    validateUpdateUserAddress(req) {
        return this.validateAddUserAddress(req);
    }
}

module.exports = new UserAddressValidator;
