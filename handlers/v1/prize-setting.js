"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const db = require('../../configs/sequelize');
const { PRIZE_TYPE, PRIZE_STATUS, SPINWHEEL_SETTING_STATUS } = require('../../configs');
const Pagination = require('../../utils/pagination');
const PrizeSettingValidator = require('../../validators/prize-setting');

class PrizeSettingHandler {
    async getAllPrizeSetting(req, res) {
        try {
            const { status, name } = req.query;

            let clause = { where: {
                status: {
                    [Op.in]: [PRIZE_STATUS.ACTIVE, PRIZE_STATUS.DISABLED]
                }
            } }

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

            return await Pagination.paging(req, res, db.models.prize_settings, clause,null, "Successfully Retrieved Prize Settings Lists")
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async getPrizeSetting(req, res) {
        try {
            const prizeSettingId = req.params.id || req.query.prize_setting_id;
            if (!prizeSettingId) {
                return BaseResponse.BadRequest(res, 'Missing params.');
            }

            const prizeSetting = await db.models.prize_settings.findOne({
                where: { id: prizeSettingId }
            });
            if (!prizeSetting) {
                return BaseResponse.BadResponse(res, 'Prize Setting Data Not Found');
            }

            return BaseResponse.Success(res, 'Prize Setting Data Found', { data: prizeSetting });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async addPrizeSetting(req, res) {
        try {
            const validator = PrizeSettingValidator.validateAddPrizeSetting(req);
            if (!validator.success) {
                return BaseResponse.UnprocessableEntity(res, validator.message, {
                    errors: validator.error
                });
            }

            const formData = validator.data;

            const prizeSetting = await db.models.prize_settings
                .create({ ...formData })

            return BaseResponse.Success(res, 'Prize Setting successfully Added', {
                data: prizeSetting
            });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async updatePrizeSetting(req, res) {
        try {
            const prizeSettingId = req.params.id || req.query.prize_setting_id;

            if (!prizeSettingId) {
                return BaseResponse.BadRequest(res, 'Missing params');
            }

            const validator = PrizeSettingValidator.validateUpdatePrizeSetting(req);
            if (!validator.success) {
                return BaseResponse.UnprocessableEntity(res, validator.message, {
                    errors: validator.error
                });
            }

            const prizeSetting = await db.models.prize_settings.findOne({
                where: { id: prizeSettingId },
            });

            if (!prizeSetting) {
                return BaseResponse.BadResponse(res, 'Prize Setting Not Found');
            }

            const formData = validator.data;

            if (prizeSetting.status === PRIZE_STATUS.ACTIVE && formData.status === PRIZE_STATUS.DISABLED) {
                const activeSpinwheelSetting = await db.models.spinwheel_settings.findOne({
                    where: {
                        status: SPINWHEEL_SETTING_STATUS.ACTIVE,
                        prize_id: prizeSetting.id
                    }
                });
    
                if (activeSpinwheelSetting) {
                    return BaseResponse.BadResponse(res, 'Prize Setting Not Found');
                }
            }

            const updated = await prizeSetting.update({ ...formData });
            return BaseResponse.Success(res, 'Prize Setting successfully Updated', {
                data: updated
            });
        } catch (err) {
            console.log(err);
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async deletePrizeSetting(req, res) {
        try {
            const prizeSettingId = req.params.id || req.query.prize_setting_id;
            if (!prizeSettingId) {
                return BaseResponse.BadRequest(res, 'Missing params');
            }

            const prizeSetting = await db.models.prize_settings.findOne({
                where: {
                    id: prizeSettingId,
                    [Op.or]: [
                        {
                            status: PRIZE_STATUS.ACTIVE,
                        },
                        {
                            status: PRIZE_STATUS.DISABLED,
                        },
                    ]
                },
                // include: [
                //     {
                //         model: db.models.spinwheel_settings,
                //         as: 'prize_settings', // This should be spinwheel_settings but model define the name as prize_settings
                //         attributes: ['id'],
                //         where: {
                //             status: SPINWHEEL_SETTING_STATUS.ACTIVE,
                //         }
                //     }
                // ]
            });

            if (!prizeSetting) {
                return BaseResponse.BadResponse(res, 'Prize Setting Not Found');
            }

            const spinwheel_settings = await db.models.spinwheel_settings.findAll({
                where: {
                    prize_id: prizeSettingId,
                }
            });

            // Validate if this prize is using
            if (spinwheel_settings && spinwheel_settings.length) {
                return BaseResponse.BadRequest(res, 'This prize is used in spinwheel. Please remove this prize in relative spinwheel configs before remove it.');
            }

            prizeSetting.status = PRIZE_STATUS.REMOVED;
            await prizeSetting.save();
            return BaseResponse.Success(res, 'Prize Setting successfully deleted', { data: prizeSetting });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }
}

module.exports = new PrizeSettingHandler;
