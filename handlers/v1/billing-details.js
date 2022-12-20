"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const BillingDetailsValidator = require('../../validators/billing-details');
const Pagination = require('../../utils/pagination');

class BillingDetailsHandler {

    async getAllBillingDetails(req, res) {
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

        return await Pagination.paging(req, res, db.models.billing_details, clause, null, "Successfully Retrieved Billing Details Lists")
    }

    async getBillingDetails(req, res) {
        await db.models.billing_details.findOne({
            where: { id: req.query.billing_details_id },
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
        }).then( billingDetails => {
            if (billingDetails) return BaseResponse.Success(res, 'Billing Details Data Found', { data: billingDetails });
            return BaseResponse.BadResponse(res, 'Billing Details Data Not Found');
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        });
    }

    async addBillingDetails(req, res) {
        const validator = BillingDetailsValidator.validateAddBillingDetails(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;

        await db.models.billing_details.create({ 
            user_id: req.user.id,
            ...formData,
        }).then(async (newBillingDetails) => {

            await db.models.billing_details.findOne({
                where: { id: newBillingDetails.id },
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
            }).then(billingDetails => {
                return BaseResponse.Success(res, 'Billing Details successfully Added', {
                    data: billingDetails
                });
            })
                
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        })
    }

    async updateBillingDetails(req, res) {
        let billingDetails = await db.models.billing_details.findOne({
            where: { id: req.query.billing_details_id }
        })

        if (!billingDetails) return BaseResponse.BadResponse(res, 'Billing Details Data Not Found');


        const validator = BillingDetailsValidator.validateUpdateBillingDetails(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });


        const formData = validator.data;

        await billingDetails.update({ ...formData })
                .then(async (billingDetailsUpdated) => {

                    await db.models.billing_details.findOne({
                        where: { id: billingDetailsUpdated.id },
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
                    }).then(billingDetails => {
                        return BaseResponse.Success(res, 'Billing Details successfully Updated', {
                            data: billingDetails
                        });
                    })
                        
                }).catch(err => {
                    return BaseResponse.BadResponse(res, err.message);
                })
    }

    async deleteBillingDetails(req, res) {
        const billingDetails = await db.models.billing_details.findOne({
            where: { id: req.body.billing_details_id },
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

        if (!billingDetails) return BaseResponse.BadResponse(res, 'Billing Details Data Not Found');

        return await billingDetails.destroy()
            .then(() => BaseResponse.Success(res, 'Billing Details Data successfully deleted', { data: billingDetails }))
            .catch(() => BaseResponse.BadResponse(res, err.message));
    }
    
}

module.exports = new BillingDetailsHandler;