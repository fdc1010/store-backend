"use strict";

const Joi = require('joi');
const CustomValidator = require('./custom-validator');


class NotificationValidator extends CustomValidator{

    validateAddNotification(req) {
        const Schema = Joi.object({
            user_id: Joi.number().required(),
            target_user_id: Joi.number().required(),
            ref_id: Joi.number().required(),
            type: Joi.number().required(),
            title: Joi.string(),
            description: Joi.string(),
            thumbnail: Joi.string(),
            action: Joi.string()
        });
        return this.validateSchema(Schema, req);
    }
}

module.exports = new NotificationValidator;