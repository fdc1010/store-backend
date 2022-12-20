const Joi = require('joi');


const CustomValidator = require('./custom-validator');

class SpinwheelSetting extends CustomValidator {

    validateAddSpinwheelSetting(req) {
        const Schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string(),
            prize_id: Joi.number().required(),
            num_spin: Joi.number(),
            start_date: Joi.date(),
            end_date: Joi.date(),
            status: Joi.number().optional().valid(0,1),
        })

        return this.validateSchema(Schema, req);
    }

    validateUpdateSpinwheelSetting(req) {
        return this.validateAddSpinwheelSetting(req);
    }
}

module.exports = new SpinwheelSetting;