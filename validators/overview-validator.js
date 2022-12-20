"use strict";

const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class Overview extends CustomValidator {

    validateDateOverview(req) {
        const Schema = Joi.object({
            date: Joi.date(),
        })
        const validate = Schema.validate(req.query);

        if (validate.error) {
            return {
                success: false,
                message: validate.error.message,
                error: validate.error.details
            };
        }

        return {
            success: true,
            data: validate.value || null
        };
    }
}
module.exports = new Overview;