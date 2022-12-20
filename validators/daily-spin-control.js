"use strict";

const Joi = require('joi');
const {SPIN_CONTROL_STATUS, SPINWHEEL_SETTING_STATUS} = require('../configs');
const CustomValidator = require('./custom-validator');

class DailySpinControl extends CustomValidator {
    constructor() {
        super();
        const defaultOptionsSchema = {
            name: Joi.string().required(),
            description: Joi.string(),
            prize_id: Joi.number().required(),
            num_spin: Joi.number().optional(),
            start_date: Joi.date().optional(),
            end_date: Joi.date().optional(),
            status: Joi.number().optional().valid(
                SPINWHEEL_SETTING_STATUS.ACTIVE,
                SPINWHEEL_SETTING_STATUS.DISABLED,
            ),
            total_winners: Joi.number().required(),
        };

        const defaultDailySpinControlSchema = {
            total_winners	: Joi.number().optional(),
            spin_per_user: Joi.number().required(),
            is_infinite: Joi.number(),
            spin_date_until: Joi.date().optional(),
            spin_date: Joi.date().optional(),
            status: Joi.number().optional().valid(
                SPIN_CONTROL_STATUS.DISABLED,
                SPIN_CONTROL_STATUS.ACTIVE,
            ),
            monthly_dollars: Joi.number().required(),
            monthly_points: Joi.number().required(),
            daily_dollars: Joi.number().required(),
            daily_points: Joi.number().required(),
        }

        this.createDailySpinControl = Joi.object({
            ...defaultDailySpinControlSchema,
            options: Joi.array().optional().items(Joi.object(defaultOptionsSchema)),
        });

        this.updateDailySpinControl = Joi.object({
            id: Joi.number().optional(),
            ...defaultDailySpinControlSchema,
            options: Joi.array().optional().items(Joi.object({
                ...defaultOptionsSchema,
                id: Joi.number().optional(),
                spinwheel_id: Joi.number().optional(),
                num_spin: Joi.number().optional(),
                created_at: Joi.date().optional(),
                updated_at: Joi.date().optional(),
                start_date: Joi.date().optional().allow(null),
                end_date: Joi.date().optional().allow(null),
            })),
        });
    }
    validateAddDailySpinControl(req) {
        return this.validateSchema(this.createDailySpinControl, req);
    }

    validateUpdateDailySpinControl(req) {
        return this.validateSchema(this.updateDailySpinControl, req);
    }
}

module.exports = new DailySpinControl;
