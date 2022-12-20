"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const ShippingDetailsValidator = require('../../validators/shipping-details');
const Pagination = require('../../utils/pagination');

class ShippingDetailsHandler {
    async addOrderShippingAddress(orderid, userid, address, addressstatus = 1) {
        const shippingAddress = await db.models.shipping_details.findOne({
            where: {
                order_id: orderid,
                user_id: userid,
                address_1: address,
                // status: addressstatus
            }
        });
        if(!shippingAddress){
            await db.models.shipping_details.create({
                order_id: orderid,
                user_id: userid,
                address_1: address,
                // status: addressstatus
            });
        }
    }  
    async getAllShippingDetails(req, res) {
        const { user_id, user_name, order_id, name, address } = req.query;

        let clause = { 
            where: {},
        }

        if (user_id) {
            clause = { where: { 
                ...clause.where,
                user_id: user_id
            }}
        }
        if (user_name) {
            clause = { where: { 
                ...clause.where,
                '$user.name$': user_name
            }}
        }
        if (order_id) {
            clause = { where: { 
                ...clause.where,
                order_id: order_id
            }}
        }
        if (name) {
            clause = { where: { 
                ...clause.where,
                name: { [Op.like] : `%${name}%` } 
            }}
        }
        if (address) {
            clause = { where: { 
                ...clause.where,
                [Op.or]: [
                    { address1: { [Op.like] : `%${address}%` } },
                    { address2: { [Op.like] : `%${address}%` } },
                ]
            }}
        }

        clause = {
            where: {
                ...clause.where
            },
            include: [
                {
                    model: db.models.users,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    },
                },
                {
                    model: db.models.orders,
                    as: 'order',
                }
            ]
        }
        console.log(clause.where);

        if (!clause.where) { clause = {} }

        return await Pagination.paging(req, res, db.models.shipping_details, clause, null, "Successfully Retrieved Shipping Details Lists")
    }

    async getShippingDetails(req, res) {
        await db.models.shipping_details.findOne({
            where: { id: req.query.shipping_details_id },
            attributes: {
                exclude: ['user_id', 'order_id']
            },
            include: [
                {
                    model: db.models.users,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    },
                },
                {
                    model: db.models.orders,
                    as: 'order',
                }
            ]
        }).then( shippingDetails => {
            if (shippingDetails) return BaseResponse.Success(res, 'Shipping Details Data Found', { data: shippingDetails });
            return BaseResponse.BadResponse(res, 'Shipping Details Data Not Found');
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        });
    }

    async addShippingDetails(req, res) {
        const validator = ShippingDetailsValidator.validateAddShippingDetails(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;

        await db.models.shipping_details.create({ 
            user_id: req.user.id,
            ...formData,
        }).then(async (newShippingDetails) => {

            await db.models.shipping_details.findOne({
                where: { id: newShippingDetails.id },
                attributes: {
                    exclude: ['order_id', 'user_id']
                },
                include: [
                    {
                        model: db.models.users,
                        as: 'user',
                        attributes: {
                            exclude: ['password']
                        },
                    },
                    {
                        model: db.models.orders,
                        as: 'order',
                    }
                ]
            }).then(shippingDetails => {
                return BaseResponse.Success(res, 'Shipping Details successfully Added', {
                    data: shippingDetails
                });
            })
                
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        })
    }

    async updateShippingDetails(req, res) {
        let shippingDetails = await db.models.shipping_details.findOne({
            where: { id: req.query.shipping_details_id }
        })

        if (!shippingDetails) return BaseResponse.BadResponse(res, 'Shipping Details Data Not Found');


        const validator = ShippingDetailsValidator.validateUpdateShippingDetails(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });


        const formData = validator.data;

        await shippingDetails.update({ ...formData })
                .then(async (shippingDetailsUpdated) => {

                    await db.models.shipping_details.findOne({
                        where: { id: shippingDetailsUpdated.id },
                        attributes: {
                            exclude: ['order_id', 'user_id']
                        },
                        include: [
                            {
                                model: db.models.users,
                                as: 'user',
                                attributes: {
                                    exclude: ['password']
                                },
                            },
                            {
                                model: db.models.orders,
                                as: 'order',
                            }
                        ]
                    }).then(shippingDetails => {
                        return BaseResponse.Success(res, 'Shipping Details successfully Updated', {
                            data: shippingDetails
                        });
                    })
                        
                }).catch(err => {
                    return BaseResponse.BadResponse(res, err.message);
                })
    }

    async deleteShippingDetails(req, res) {
        const shippingDetails = await db.models.shipping_details.findOne({
            where: { id: req.body.shipping_details_id },
            attributes: {
                exclude: ['user_id', 'order_id']
            },
            include: [
                {
                    model: db.models.users,
                    as: 'user',
                    attributes: {
                        exclude: ['password']
                    },
                },
                {
                    model: db.models.orders,
                    as: 'order',
                }
            ]
        })

        if (!shippingDetails) return BaseResponse.BadResponse(res, 'Shipping Details Data Not Found');

        return await shippingDetails.destroy()
            .then(() => BaseResponse.Success(res, 'Shipping Details Data successfully deleted', { data: shippingDetails }))
            .catch(() => BaseResponse.BadResponse(res, err.message));
    }
    
}

module.exports = new ShippingDetailsHandler;
