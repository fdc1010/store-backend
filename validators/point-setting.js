"use strict";

const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class PointSetting extends CustomValidator {

    validateAddPointSetting(req) {
        const Schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            points: Joi.number().required(),
            status: Joi.number().optional().valid(0,1),
        })
        return this.validateSchema(Schema, req);
    }

    validateUpdatePointSetting(req) {
        return this.validateAddPointSetting(req);
    }
}
module.exports = new PointSetting;