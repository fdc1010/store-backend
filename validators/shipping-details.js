const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class ShippingDetails extends CustomValidator {

    validateAddShippingDetails(req) {
        const Schema = Joi.object({
            order_id: Joi.number().required(),
            user_id: Joi.number(),
            name: Joi.string()
                .required()
                .min(3)
                .max(32),
            contact_no: Joi.string()
                .regex(/^[+]*[0-9]{10,15}$/im)
                .messages({
                    'string.pattern.base': 'Phone number is invalid'
                }),
            address1: Joi.string(),
            address2: Joi.string(),
            city: Joi.string(),
            postal_code: Joi.number(),
            contact_number: Joi.string()
                .regex(/^[+]*[0-9]{10,15}$/im)
                .messages({
                    'string.pattern.base': 'Phone number is invalid'
                })
        });
    
        return this.validateSchema(Schema, req);
    }

    validateUpdateShippingDetails(req) {
        return this.validateAddShippingDetails(req);
    }

}

module.exports = new ShippingDetails;