const Joi = require('joi');
const {ValidationError} = require('joi');
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');

class PushNotificationValidator extends CustomValidator {
    validateUpdatePushNotification(req) {
        const Schema = Joi.object({
            order_updates: Joi.number().optional().valid(0,1),
            chats: Joi.number().optional().valid(0,1),
            promotions: Joi.number().optional().valid(0,1),
            status: Joi.number().optional().valid(0,1),
        })

        return this.validateSchema(Schema, req);
    }
}

module.exports = new PushNotificationValidator;