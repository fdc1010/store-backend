"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const SpinwheelSettingValidator = require('../../validators/spinwheel-setting');
const Pagination = require('../../utils/pagination');
const { isUserCanSpin } = require('../../handlers/v1/user-spinwheel');
const { SPINWHEEL_SETTING_STATUS } = require('../../configs');
const SpinControlService = require('../../services/spin-control.service');
const SpinwheelSettingsService = require('../../services/spinwheel-settings.service');
class SpinwheelSettingHandler {

    async getDailySpinwheel(req, res, next) {
        try {
            const currentSpinControl = await SpinControlService.getCurrentDailySpinControl();

            if (!currentSpinControl) {
                return BaseResponse.BadResponse(res, 'Cannot find configs for spinwheel.');
            }

            const spinOptions = await SpinwheelSettingsService.getSpinwheelSettingsBySpinControl({
                spinId: currentSpinControl.id,
                include: {
                    model: db.models.prize_settings,
                    as: 'prize_setting',
                    attributes: ['id','name','description','prizes']
                }
            });

            return BaseResponse.Success(res, 'Spinwheel Settings', {
                data: spinOptions,
            });
            
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async getAllSpinwheelSetting(req, res) {
        try {
            const { status, name } = req.query;

            let clause = { where: {} }

            if (status) {
                clause = { where: { 
                    ...clause.where,
                    status: parseInt(status)
                }}
            }

            if (name) {
                clause = { where: { 
                    ...clause.where,
                    name: { [Op.like] : `%${name}%` } 
                }}
            }

            if (!clause.where) { clause = {}}
            const include = {
                model: db.models.prize_settings,
                as: 'prize_setting',
                attributes: ['id','name','description','prizes']
            };
        

            if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
                return await Pagination.paging(req, res, db.models.spinwheel_settings, clause,include, "Successfully Retrieved Spinwheel Settings Lists");
            }else{
                clause.include = include;
                const spinwheel_settings = await db.models.spinwheel_settings.findAll(clause);
                return BaseResponse.Success(res, 'Spinwheel Settings', {
                    data: spinwheel_settings
                });
            }
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async getSpinwheelSetting(req, res) {
        await db.models.spinwheel_settings.findOne({
            where: { id: req.query.spinwheel_setting_id }
        }).then(spinwheelSetting => {
            if (spinwheelSetting) return BaseResponse.Success(res, 'Spinwheel Setting Data Found', { data: spinwheelSetting });
            return BaseResponse.BadResponse(res, 'Spinwheel Setting Data Not Found');
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        });
    }

    async addSpinwheelSetting(req, res) {
        const validator = SpinwheelSettingValidator.validateAddSpinwheelSetting(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;

        const prizeSetting = await db.models.spinwheel_settings
             .create({ ...formData })
    
        return BaseResponse.Success(res, 'Spinwheel Setting successfully Added', {
            data: prizeSetting
        });
    }

    async updateSpinwheelSetting(req, res) {
        let spinwheelSetting = await db.models.spinwheel_settings.findOne({
            where: { id: req.query.spinwheel_setting_id }
        })

        if (!spinwheelSetting) return BaseResponse.BadResponse(res, 'Spinwheel Setting Data Found');

        const validator = SpinwheelSettingValidator.validateUpdateSpinwheelSetting(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;

        await spinwheelSetting.update({ ...formData })
                .then(spinwheelSetting => {
                    return BaseResponse.Success(res, 'Spinwheel successfully Updated', {
                        data: spinwheelSetting
                    });
                }).catch(err => {
                    return BaseResponse.BadResponse(res, err.message);
                })
    }

    async deleteSpinwheelSetting(req, res) {
        try {
            const id = req.params.id || req.body.spinwheel_setting_id;
            if (!id) {
                return BaseResponse.BadRequest(res, 'Missing params.');
            }
            const spinwheelSetting = await db.models.spinwheel_settings.findOne({
                where: { id }
            });
    
            if (!spinwheelSetting) return BaseResponse.BadResponse(res, 'Spinwheel Setting Not Found');

            spinwheelSetting.status = SPINWHEEL_SETTING_STATUS.REMOVED;
            await spinwheelSetting.save();

            return BaseResponse.Success(res, 'Spinwheel Setting successfully deleted', { data: spinwheelSetting });
        } catch(err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    
}

module.exports = new SpinwheelSettingHandler;
