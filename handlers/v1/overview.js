"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('../../configs/moment');
const Joi = require('joi');

const db = require('../../configs/sequelize');
const OverviewValidator = require('../../validators/overview-validator');


class OverviewHandler {

    async getTotalSalesRevenue(req, res) {

        const validator = OverviewValidator.validateDateOverview(req);
        if (!validator.success) {
            return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });
        }

        // if no date query default current date
        let date = validator.data.date
            ? validator.data.date
            : new Date();

        // handle compare timestamp of datetime
        let clause = { 
            where: {
                created_at: {
                    [Op.between]: [
                        moment(date).startOf('day'), 
                        moment(date).endOf('day')
                    ]
                }
            } 
        }
    
        // check if merchant
        if (req.user.role_id === 3) {
            clause = {
                where: {
                    ...clause.where,
                    user_id: req.user.id
                }
            }
        }
    
        try {
            // datavalues result as totalSalesRevenue
            const { dataValues: totalSalesRevenue  } = await db.models.orders
                .findOne({
                    attributes: [
                        // Sum of yesterday
                        [Sequelize.literal(`(
                            SELECT COALESCE(SUM(total), 0) FROM orders
                            WHERE (
                                created_at >= '${moment(date).subtract(1, 'days').startOf('date').format('YYYY-MM-DD HH:mm:ss')}' and
                                created_at <= '${moment(date).subtract(1, 'days').endOf('date').format('YYYY-MM-DD HH:mm:ss')}'
                            )
                        )`),
                        'yesterday'],
                        // Sum of today
                        [Sequelize.literal(`(
                            SELECT COALESCE(SUM(total), 0) FROM orders
                            WHERE (
                                created_at >= '${moment(date).startOf('date').format('YYYY-MM-DD HH:mm:ss')}' and
                                created_at <= '${moment(date).endOf('date').format('YYYY-MM-DD HH:mm:ss')}'
                            )
                        )`),
                        'now'],
                    ],
                    logging: console.log
                })
            
            const total_yesterday = totalSalesRevenue.yesterday
            const total_now = totalSalesRevenue.now
            let total_percentage_from_yesterday = (() => {
                if (total_yesterday === total_now) return 0;
                if (total_yesterday === 0) return 100;

                if (total_yesterday <= total_now) {
                    return +parseFloat((
                        (total_now - total_yesterday) / total_yesterday
                    ) * 100).toFixed(2)
                } 

                return -parseFloat((
                    (total_yesterday - total_now) / total_yesterday
                ) * 100).toFixed(2)
            })()

            return BaseResponse.Success(res, 'Get Total Sales Revenue Success', { 
                data: { 
                    total_yesterday,
                    total_now, 
                    total_percentage_from_yesterday 
                } 
            });
        } catch (err) {
            console.log(err.message)
            return BaseResponse.BadResponse(res, 'Get Total Sales Revenue Error', { data: 0 });
        }
        
    }

    async getTotalNumberOrders(req, res) {

        const validator = OverviewValidator.validateDateOverview(req);
        if (!validator.success) {
            return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });
        }

        // if no date query default current date
        let date = validator.data.date
            ? validator.data.date
            : new Date();

        // handle compare timestamp of datetime
        let clause = { 
            where: {
                created_at: {
                    [Op.between]: [
                        moment(date).startOf('day'), 
                        moment(date).endOf('day')
                    ]
                }
            } 
        }
    
        // check if merchant
        if (req.user.role_id === 3) {
            clause = {
                where: {
                    ...clause.where,
                    user_id: req.user.id
                }
            }
        }
    
        try {
            // datavalues result as totalOrders
            const { dataValues: totalOrders  } = await db.models.orders
                .findOne({
                    attributes: [
                        // Sum of yesterday
                        [Sequelize.literal(`(
                            SELECT COUNT(id) FROM orders
                            WHERE (
                                created_at >= '${moment(date).subtract(1, 'days').startOf('date').format('YYYY-MM-DD HH:mm:ss')}' and
                                created_at <= '${moment(date).subtract(1, 'days').endOf('date').format('YYYY-MM-DD HH:mm:ss')}'
                            )
                        )`),
                        'yesterday'],
                        // Sum of today
                        [Sequelize.literal(`(
                            SELECT COUNT(id) FROM orders
                            WHERE (
                                created_at >= '${moment(date).startOf('date').format('YYYY-MM-DD HH:mm:ss')}' and
                                created_at <= '${moment(date).endOf('date').format('YYYY-MM-DD HH:mm:ss')}'
                            )
                        )`),
                        'now'],
                    ],
                    group: 'id',
                    logging: console.log
                })
            const total_yesterday = totalOrders.yesterday
            const total_now = totalOrders.now
            let total_percentage_from_yesterday = (() => {
                if (total_yesterday === total_now) return 0;
                if (total_yesterday === 0) return 100;

                if (total_yesterday <= total_now) {
                    return +parseFloat((
                        (total_now - total_yesterday) / total_yesterday
                    ) * 100).toFixed(2)
                } 

                return -parseFloat((
                    (total_yesterday - total_now) / total_yesterday
                ) * 100).toFixed(2)
            })()

            return BaseResponse.Success(res, 'Get Total Sales Revenue Success', { 
                data: { 
                    total_yesterday,
                    total_now, 
                    total_percentage_from_yesterday 
                } 
            });
        } catch (err) {
            console.log(err.message)
            return BaseResponse.BadResponse(res, 'Get Total Sales Revenue Error', { data: 0 });
        }

    }

    async getTotalDailySales(req, res) {
        
        const validator = OverviewValidator.validateDateOverview(req);
        if (!validator.success) {
            return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });
        }

        // if no date query default current date
        let date = validator.data.date
            ? validator.data.date
            : new Date();
        
        // handle compare timestamp of datetime
        let clause = { 
            where: {
                created_at: {
                    [Op.between]: [
                        moment(date).startOf('day'), 
                        moment(date).endOf('day')
                    ]
                }
            } 
        }

        // check if merchant
        if (req.user.role_id === 3) {
            clause = {
                where: {
                    ...clause.where,
                    user_id: req.user.id
                }
            }
        }


        try {
            // datavalues result as totalDailySales
            const { dataValues: totalDailySales  } = await db.models.orders
                .findOne({
                    attributes: [
                        // Sum of yesterday
                        [Sequelize.literal(`(
                            SELECT COALESCE((SUM(total) / COUNT(id)), 0) FROM orders
                            WHERE (
                                created_at >= '${moment(date).subtract(1, 'days').startOf('date').format('YYYY-MM-DD HH:mm:ss')}' and
                                created_at <= '${moment(date).subtract(1, 'days').endOf('date').format('YYYY-MM-DD HH:mm:ss')}'
                            )
                        )`),
                        'yesterday'],
                        // Sum of today
                        [Sequelize.literal(`(
                            SELECT COALESCE((SUM(total) / COUNT(id)), 0) FROM orders
                            WHERE (
                                created_at >= '${moment(date).startOf('date').format('YYYY-MM-DD HH:mm:ss')}' and
                                created_at <= '${moment(date).endOf('date').format('YYYY-MM-DD HH:mm:ss')}'
                            )
                        )`),
                        'now'],
                    ],
                    group: 'id',
                    logging: console.log
                })
            const total_yesterday = totalDailySales.yesterday
            const total_now = totalDailySales.now
            let total_percentage_from_yesterday = (() => {
                if (total_yesterday === total_now) return 0;
                if (total_yesterday === 0) return 100;

                if (total_yesterday <= total_now) {
                    return +parseFloat((
                        (total_now - total_yesterday) / total_yesterday
                    ) * 100).toFixed(2)
                } 

                return -parseFloat((
                    (total_yesterday - total_now) / total_yesterday
                ) * 100).toFixed(2)
            })()

            return BaseResponse.Success(res, 'Get Total Daily Sales Success', { 
                data: { 
                    total_yesterday,
                    total_now, 
                    total_percentage_from_yesterday 
                } 
            });
        } catch (err) {
            console.log(err.message)
            return BaseResponse.BadResponse(res, 'Get Total Daily Sales Error', { data: 0 });
        }
    }

}

module.exports = new OverviewHandler;
