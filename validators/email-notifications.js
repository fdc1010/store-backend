const Joi = require('joi');
const {ValidationError} = require('joi');
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');

class EmailNotificationValidator extends CustomValidator {
    validateUpdateEmailNotification(req) {
        const Schema = Joi.object({
            order_updates: Joi.number().optional().valid(0,1),
            newsletters: Joi.number().optional().valid(0,1),
            status: Joi.number().optional().valid(0,1),
        })

        return this.validateSchema(Schema, req);
    }
}

module.exports = new EmailNotificationValidator;