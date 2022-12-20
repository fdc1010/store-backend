"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const PointSettingValidator = require('../../validators/point-setting');
const Pagination = require('../../utils/pagination');


class PointSettingHandler {

    async getAllPointSetting(req, res) {
        const {status, name} = req.query;

        let clause = { where: {} }

        if (status) {
            clause = {where: {
                ...clause.where,
                    status: parseInt(status)
                }}
        }

        if (name) {
            clause = {where: {
                ...clause.where,
                    name: { [Op.like] : `%${name}%` }
                }}
        }

        if (!clause.where) { clause = {}}

        return await Pagination.paging(req, res, db.models.point_settings, clause,null, "Successfully Retrieved Point Settings Lists");
    }

    async getPointSetting(req, res) {
        await db.models.point_settings.findOne({
            where: { id: req.query.point_setting_id }
        }).then(pointSetting => {
            if (pointSetting) return BaseResponse.Success(res, 'Point Setting Data Found', { data: pointSetting });
            return BaseResponse.BadResponse(res, err.message);
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        })
    }

    async addPointSetting(req, res) {
        const validator = PointSettingValidator.validateAddPointSetting(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;

        const pointSetting = await db.models.point_settings
            .create({...formData})

        return BaseResponse.Success(res, 'Point Setting Successfully Added', {
            data: pointSetting
        });
    }

    async updatePointSetting(req, res) {
        let pointSetting = await db.models.point_settings.findOne({
            where: { id: req.query.point_setting_id }
        })

        if (!pointSetting) return BaseResponse.BadResponse(res, 'Point Setting Not Found');

        const validator = PointSettingValidator.validateUpdatePointSetting(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;

        await pointSetting.update({ ...formData })
            .then(pointSetting => {
                return BaseResponse.Success(res, 'Point Setting Successfully Updated', {
                    data: pointSetting
                });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

    async deletePointSetting(req, res) {
        const pointSetting = await db.models.point_settings.findOne({
            where: { id: req.body.point_setting_id }
        });

        if (!pointSetting) return BaseResponse.BadResponse(res, 'Point Setting Not Found');

        return await pointSetting.destroy()
            .then((pointSetting) => {
                return BaseResponse.Success(res, 'Point Setting successfully deleted', { data: pointSetting });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            });
    }

}

module.exports = new PointSettingHandler;

