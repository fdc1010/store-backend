"use strict";

const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class UserPrizeValidator extends CustomValidator {
    validateAddUserPrize(req) {
        const Schema = Joi.object({
            user_id: Joi.number().required(),
            prize_id: Joi.number().required(),
        })
        return this.validateSchema(Schema, req);
    }

    validateUpdateUserPrize(req) {
        return this.validateAddUserPrize(req);
    }
}

module.exports = new UserPrizeValidator;