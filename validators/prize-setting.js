const Joi = require('joi');

const { PRIZE_TYPE } = require('../configs');

const CustomValidator = require('./custom-validator');

class PrizeSetting extends CustomValidator {
    constructor() {
        super();
        this.createPrizeSettingSchema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().required(),
            prizes: Joi.number().required(),
            status: Joi.number().optional().valid(0,1),
            type: Joi.number().required().valid(PRIZE_TYPE.DOLLARS, PRIZE_TYPE.POINTS),
        });
    }

    validateAddPrizeSetting(req) {
        return this.validateSchema(this.createPrizeSettingSchema, req);
    }

    validateUpdatePrizeSetting(req) {
        return this.validateSchema(this.createPrizeSettingSchema, req);
    }
}

module.exports = new PrizeSetting;
