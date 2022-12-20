"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const DailySpinControlValidator = require('../../validators/daily-spin-control');
const Pagination = require('../../utils/pagination');

const {SPIN_CONTROL_STATUS, SPINWHEEL_SETTING_STATUS} = require('../../configs');
const SpinControlService = require('../../services/spin-control.service');
const SpinwheelSettingsService = require('../../services/spinwheel-settings.service');

class DailySpinControl {
    async getAllDailySpinControl(req, res) {
        try {
            const { status } = req.query;

            let clause = {
                where: {
                    status: {
                        [Op.in]: [SPIN_CONTROL_STATUS.ACTIVE, SPIN_CONTROL_STATUS.DISABLED],
                    }
                },
                distinct: true,
            }

            if (status) {
                clause = {where: {
                    ...clause.where,
                    status: parseInt(status)
                }}
            }

            const include = [
                {
                    model: db.models.spinwheel_settings,
                    as: 'options',
                    where: {
                        status: {
                            [Op.in]: [SPINWHEEL_SETTING_STATUS.ACTIVE]
                        }
                    }
                }
            ];

            if (!clause.where) { clause = {}}

            return await Pagination.paging(req, res, db.models.daily_spin_control, clause,include, "Successfully Retrieved Daily Spin Control List");
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async getDailySpinControl(req, res) {
        try {
            const id = req.params.id || req.query.daily_spin_control_id;
            if (!id) {
                return BaseResponse.BadRequest(res, 'Mising params');
            }

            const result = await SpinControlService.getSingleSpinControl({
                where: {
                    id,
                },
                include: {
                    model: db.models.spinwheel_settings,
                    as: 'options',
                    where: {
                        status: {
                            [Op.in]: [
                                SPINWHEEL_SETTING_STATUS.ACTIVE,
                                // SPINWHEEL_SETTING_STATUS.DISABLED
                            ]
                        }
                    }
                },
            });

            if (!result) {
                return BaseResponse.NotFound(res);
            }

            return BaseResponse.Success(res, 'Daily Spin Control Data Found', {data: result});

        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async addDailySpinControl(req, res) {
        let transaction = null;
        try {
            const validator = DailySpinControlValidator.validateAddDailySpinControl(req);
            if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });

            const formData = validator.data;

            const { isValid, error } = await SpinControlService.validateSpinControl(formData);
            if (!isValid) {
                return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
            }

            const {options, ...spinData} = formData;
            transaction = await db.transaction()

            const dailySpinControl = await db.models.daily_spin_control.create(
                { ...spinData },
                { transaction }
            );
            let createdOptions = [];
            if (options && options.length) {
                // Handle create options for spinwheel.
                const spinWheelSettings = options.map(item => {
                    item.spinwheel_id = dailySpinControl.id;
                    return item;
                });

                createdOptions = await SpinwheelSettingsService.bulkCreate(spinWheelSettings, {transaction})
            }

            await transaction.commit();
            return BaseResponse.Success(res, 'Daily Spin Control Successfully Added', {
                data: {...dailySpinControl.toJSON(), options: createdOptions ?? []}
            });
        } catch (err) {
            if (transaction) {
                transaction.rollback();
            }
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async updateDailySpinControl(req, res) {
        let transaction = null;
        try {
            const id = req.params.id || req.query.daily_spin_control_id;
            if (!id) {
                return BaseResponse.BadRequest(res, 'Missing params');
            }

            // Validate req
            const validator = DailySpinControlValidator.validateUpdateDailySpinControl(req);
            if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
                error: validator.error
            });

            // Check if existed record with input id
            const dailySpinControl = await SpinControlService.getSingleSpinControl({
                where: {
                    id,
                },
                include: {
                    model: db.models.spinwheel_settings,
                    as: 'options',
                    where: {
                        status: {
                            [Op.in]: [
                                SPINWHEEL_SETTING_STATUS.ACTIVE,
                                SPINWHEEL_SETTING_STATUS.DISABLED
                            ]
                        }
                    }
                },
            });

            if (!dailySpinControl) {
                return BaseResponse.NotFound(res, 'Daily Spin Control Not Found');
            }

            const formData = validator.data;

            const { isValid, error } = await SpinControlService.validateSpinControl(formData);
            if (!isValid) {
                return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
            }

            const {options, ...spinControl} = formData;
            transaction = await db.transaction()

            const updatedSpinControl = await dailySpinControl.update({...spinControl}, {transaction})
            let updatedOptions = [];

            if (options && options.length) {
                const spinWheelSettings = options.map(item => {
                    item.spinwheel_id = dailySpinControl.id;
                    return item;
                });

                updatedOptions = await SpinwheelSettingsService.bulkCreate(
                    spinWheelSettings,
                    {
                        transaction,
                        updateOnDuplicate: [
                            'name',
                            'description',
                            'prize_id',
                            'total_winners',
                            'status',
                        ]
                    }
                );
            }

            await transaction.commit();
            return BaseResponse.Success(res, 'Daily Spin Control Successfully Updated', {
                data: {...updatedSpinControl.toJSON(), options: updatedOptions},
            });
        } catch (err) {
            if (transaction) {
                transaction.rollback();
            }
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async deleteDailySpinControl(req, res) {
        try {
            const id = req.params.id || req.body.daily_spin_control_id;
            if (!id) {
                return BaseResponse.BadRequest(res, 'Mising params');
            }

            const dailySpinControl = await SpinControlService.getSingleSpinControl({
                where: {
                    id,
                },
            });

            if (!dailySpinControl) return BaseResponse.Notfound(res, 'Daily Spin Control Not Found');

            dailySpinControl.status = SPIN_CONTROL_STATUS.REMOVED;
            await dailySpinControl.save();
            return BaseResponse.Success(res, 'Daily Spin Control Successfully deleted', { data: dailySpinControl });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async activeSpinwheel(req, res, next) {
        let transaction = null;
        try {
            const { id } = req.params;

            if (!id) {
                return BaseResponse.BadRequest(res, 'Missing params.');
            }

            const spinControl = await SpinControlService.getSingleSpinControl({
                where: {
                    id,
                }
            });

            if (!spinControl) {
                return BaseResponse.BadResponse(res, 'Not found.');
            }

            if (spinControl.is_infinite === 1) {
                return BaseResponse.Success(res, 'Update success.', { data: spinControl });
            }

            transaction = await db.transaction();

            const dailySpinControl = await SpinControlService.findOne({
                where: {
                    is_infinite: 1,
                    status: SPIN_CONTROL_STATUS.ACTIVE,
                    spin_date: null,
                    spin_date_until: null,
                }
            });

            if (dailySpinControl) {
                dailySpinControl.is_infinite = 0;
                dailySpinControl.save({ transaction });
            }

            spinControl.is_infinite = 1;
            await spinControl.save({ transaction });

            await transaction.commit();

            return BaseResponse.Success(res, 'Update success.', { data: spinControl });

        } catch (err) {
            if (transaction) {
                transaction.rollback();
            }
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async changeStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!id) {
                return BaseResponse.BadResponse(res, 'Missing params');
            }

            // Check if existed record with input id
            const dailySpinControl = await SpinControlService.getSingleSpinControl({
                where: {
                    id,
                },
            });

            if (!dailySpinControl) {
                return BaseResponse.NotFound(res, 'Daily Spin Control Not Found');
            }

            dailySpinControl.status = status;

            const { isValid, error } = await SpinControlService.validateSpinControl(dailySpinControl);
            if (!isValid) {
                return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
            }

            await dailySpinControl.save();

            return BaseResponse.Success(res, 'Change status successfully.', { data: dailySpinControl });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }
}

module.exports = new DailySpinControl;
