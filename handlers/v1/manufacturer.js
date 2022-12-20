"use strict";

const ManufacturerValidator = require('../../validators/manufacturer');
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination');

class ManufacturerHandler {

    async getAllManufacturers(req, res){
        return await Pagination.paging(req, res, db.models.manufacturers, {});
    }

    async addManufacturer(req, res){
        const validator = ManufacturerValidator.validateAddManufacturer(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const manufacturer = await  db.models.manufacturers.create({
            name: formData.name,
            description: formData.description
        });

        return BaseResponse.Success(res, 'Manufacturer added successfully.', {
            data: manufacturer
        })
    }

    async getManufacturer(req, res){
        const manufacturerId = req.query.manufacturer_id;

        const manufacturer = await db.models.manufacturers.findOne({
            where: {
                id: manufacturerId
            }
        });

        if (manufacturer){
            return BaseResponse.Success(res, 'Manufacturer Found', {
                data: manufacturer
            })
        }else{
            return  BaseResponse.BadResponse(res, 'Manufacturer not found');
        }

    }

    async updateManufacturer(req, res){
        const validator = ManufacturerValidator.validateAddManufacturer(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const manufacturerId = req.query.manufacturer_id;

        db.models.manufacturers.update({
            name: formData.name,
            description: formData.description
        }, {
            where: {
                id: manufacturerId
            }
        }).then(async (result) => {
            const manufacturer = await db.models.manufacturers.findOne({
               where: {
                   id: manufacturerId
               }
            });

            return BaseResponse.Success(res, 'Manufacturer updated', {
                data: manufacturer
            })
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        })
    }

    async deleteManufacturer(req, res){
        return await db.models.manufacturers.destroy({ where: {id: req.body.manufacturer_id } })
            .then(manufacturer => {
                if (manufacturer) return BaseResponse.Success(res, 'Manufacturer successfully deleted', { data: manufacturer});
                return BaseResponse.BadResponse(res, 'Manufacturer not found!');
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

}

module.exports = new ManufacturerHandler;