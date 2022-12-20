"use strict";

const UserAddressValidator = require('../../validators/user-address');
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination');

class UserAddressHandler {

    async getAllAddresses(req, res) {
        return await Pagination.paging(req, res, db.models.user_addresses, {});
    }

    async findUserAddress(req, res) {
        //const userAddressId = req.query.user_address_id;
        const userId = req.user.id;

        const userAddress = await db.models.user_addresses.findAll({
            where: {
                user_id: userId
            }
        });

        if (userAddress) {
            return BaseResponse.Success(res, 'User Address Found', {
                data: userAddress
            })
        }else{
            return BaseResponse.BadResponse(res, 'User Address not found');
        }
    }

    async addBuyersAddress(orderid,userid, address, addressstatus = 1) {
        const userAddress = await db.models.user_addresses.findOne({
            where: {
                order_id: orderid,
                user_id: userid,
                full_address: address,
                status: addressstatus
            }
        });
        if(!userAddress){
            await db.models.user_addresses.create({
                user_id: userid,
                full_address: address,
                status: addressstatus
            });
        }
    }
    
    async addUserAddress(req, res) {
        try {
            const validator = UserAddressValidator.validateAddUserAddress(req);
            if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });

            const formData = validator.data;
            const user = req.user;

            const userAddress = await db.models.user_addresses.create({
                user_id: user.id,
                label: formData.label,
                // full_address: formData.full_address,
                street_name: formData.street_name,
                block_no: formData.block_no,
                unit_no: formData.unit_no,
                building_name: formData.building_name,
                postal_code: formData.postal_code,
                latitude: formData.latitude,
                longitude: formData.longitude,
            });

            return BaseResponse.Success(res, 'User Address added successfully.', {
                data: userAddress
            });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    async updateUserAddress(req, res) {
        try {
            const validator = UserAddressValidator.validateAddUserAddress(req);
            if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });

            const formData = validator.data;
            const userAddressId = req.query.user_address_id;

            const userAddress = await db.models.user_addresses.findOne({
                where: {
                    id: userAddressId,
                }
            });

            if (!userAddress) {
                return BaseResponse.BadResponse(res, 'Not found.');
            }

            const result = await userAddress.update({
                label: formData.label,
                // full_address: formData.full_address,
                street_name: formData.street_name,
                block_no: formData.block_no,
                unit_no: formData.unit_no,
                building_name: formData.building_name,
                postal_code: formData.postal_code,
                latitude: formData.latitude,
                longitude: formData.longitude,
            }, {
                where: {
                    id: userAddressId
                }
            });

            return BaseResponse.Success(res, 'User Address updated', {
                data: result,
            })
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
        
    }

    async getUserAddress(req, res) {
        const userAddressId = req.query.user_address_id;

        const userAddress = await db.models.user_addresses.findOne({
            where: {
                id: userAddressId
            }
        });

        if (userAddress) {
            return BaseResponse.Success(res, 'User Address Found', {
                data: userAddress
            })
        }else{
            return BaseResponse.BadResponse(res, 'User Address not found');
        }
    }

    async deleteUserAddress(req, res) {
        return await db.models.user_addresses.destroy({ where: { id: req.query.user_address_id } })
            .then(userAddress => {
                if (userAddress) return BaseResponse.Success(res, 'User Address successfully deleted', {data: userAddress});
                return BaseResponse.BadResponse(res, 'User Address Not Found!');
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            })
    }

}

module.exports = new UserAddressHandler;












