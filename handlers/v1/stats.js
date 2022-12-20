"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination');
const moment = require('../../configs/moment');

const OrderService = require('../../services/orders.service');
const {ROLES} = require('../../configs');
const StatsRequestValidator = require('../../validators/stats');
const ProductService = require('../../services/products.service');

const countOrders = async(parseDateF,parseDateT,user_id = null) => {
    let clause = {}
    clause.where = {
        status: { [Op.in] : [0, 1, 2, 3, 4]},
        created_at: {
            [Op.between]: [moment(parseDateF).startOf('day'), moment(parseDateT).endOf('day')]
        }
    }

    clause.include = ['order_items','order_payment_logs']

    if(user_id) clause.where.user_id = user_id;
    return await db.models.orders.findAll(clause)
                                .then(async(orders) => {
                                    let cnt_order_items = 0
                                    orders.map(order => {
                                        cnt_order_items += order.order_items.length;
                                    });

                                    return { count_orders: orders.length, count_order_items: cnt_order_items };
                                })
                                .catch(err => {
                                    console.log("error: ",err.message);
                                    return 0;
                                });
    
};

const totalRevenues = async(parseDateF,parseDateT,user_id = null) => {
    
    let clause = {
        where: {
            status: 4,
            created_at: {
                [Op.between]: [moment(parseDateF).startOf('day'), moment(parseDateT).endOf('day')]
            }
        },
        attributes: {
            include: [
                        [db.fn('date', db.col('orders.created_at')), 'order_date']
                    ]
        },
        order: [['id','DESC']],
        include: ['order_items','order_payment_logs']
    };

    if(user_id) clause.where.user_id = user_id;

    return await db.models.orders.findAll(clause)
                                .then(async(orders) => {
                                    let order_received = 0, order_payment = 0, cnt_order_items = 0;

                                    orders.map(order => {
                                        order_received = parseFloat(order_received) + parseFloat(order.total);
                                        cnt_order_items += order.order_items.length;                                        
                                    });

                                    orders.map(items => {
                                        let elems = items.toJSON();
                                        if(items.order_payment_logs){
                                            // console.log("elems.order_payment_logs",elems.order_payment_logs);
                                            items.order_payment_logs.map(ordp => {
                                                const { id, order_id } = ordp
                                                const { amount, status } = ordp.response
                                                
                                                if(status == "completed"){
                                                    order_payment = parseFloat(order_payment) + parseFloat(amount);
                                                    // console.log("id, order_id,amount, status",id, order_id,amount, status);
                                                }
                                            });

                                            
                                        }
                                    });
                                    // console.log("orders.length",orders.length);
                                    return { count_succ_orders: orders.length, count_succ_order_items: cnt_order_items, order_received: order_received, order_payment: order_payment, orders: orders };
                                })
                                .catch(err => {
                                    console.log("error: ",err.message);
                                    return 0;
                                });
};

const dailySales = async(parseDateF,parseDateT,user_id = null) => {
    
    const total_revenues = await totalRevenues(parseDateF,parseDateT,user_id);

    const numDays = await getNumDays(parseDateF,parseDateT);

    const avgDailySales = numDays > 0 ? (total_revenues.order_payment / numDays) : 0;

    let clause = {
        where: {
            status: 4,
            created_at: {
                [Op.between]: [moment(parseDateF).startOf('day'), moment(parseDateT).endOf('day')]
            }
        },
        attributes: [
            [db.fn('date', db.col('created_at')), 'order_date'],
            [db.fn('sum', db.col('total')), 'sales']
        ],
        group: ['order_date'],
        order: [[db.fn('date', db.col('created_at')),'DESC']],
        // include: ['order_items']
    };

    if(user_id) clause.where.user_id = user_id;

    return await db.models.orders.findAll(clause)
                                .then(async(orders) => {

                                    return { avg_daily_sales: avgDailySales, daily_sales: orders.subtotal, orders: orders };

                                })
                                .catch(err => {
                                    console.log("error: ",err.message);
                                    return 0;
                                });
};

const getNumDays = async(parseDateF,parseDateT) => {
    
    var dtFrom = moment(parseDateF,'YYYY-MM-DD');
    var dtTo = moment(parseDateT).startOf('day');

    const diffDays = dtTo.diff(dtFrom);
    const numDays = parseInt(moment.duration(diffDays).asDays());

    return numDays;
};

class StatsHandler {
    async getInfo(req,res){
        if(!req.query.date) return BaseResponse.BadResponse(res, "Date From is required");
        const { date } = req.query;
        const parseDateF = moment(date).format('YYYY-MM-DD');
        let parseDateT = parseDateF;
        if(req.query.dateto) parseDateT = moment(req.query.dateto).format('YYYY-MM-DD');
        const cnt_orders = await countOrders(parseDateF,parseDateT); // Include statuses: 0, 1, 2, 3, 4
        const total_revenues = await totalRevenues(parseDateF,parseDateT);
        const daily_sales = await dailySales(parseDateF,parseDateT);
        const numDays = await getNumDays(parseDateF,parseDateT);

        const stats = { 
            count_days: numDays, 
            count_orders: cnt_orders.count_orders, 
            count_order_items: cnt_orders.count_order_items, 
            count_succ_orders: total_revenues.count_succ_orders, 
            count_succ_order_items: total_revenues.count_succ_order_items, 
            expected_sales: total_revenues.order_received, 
            revenues: total_revenues.order_payment, 
            sales_variance: total_revenues.order_received - total_revenues.order_payment,
            avg_daily_sales: daily_sales.avg_daily_sales, 
            daily_sales: daily_sales.orders, 
            orders: total_revenues.orders
        };
        return BaseResponse.Success(res, `Stats Summary ${parseDateF} - ${parseDateT}`, { data: stats });
    }
    async getInfoByUserId(req,res){
        if(!req.query.date) return BaseResponse.BadResponse(res, "Date From is required");
        if(!req.query.user_id) return BaseResponse.BadResponse(res, "User Id is required");
        const { date } = req.query;
        const parseDateF = moment(date).format('YYYY-MM-DD');
        let parseDateT = parseDateF;
        if(req.query.dateto) parseDateT = moment(req.query.dateto).format('YYYY-MM-DD');
        const cnt_orders = await countOrders(parseDateF,parseDateT,req.query.user_id);
        const total_revenues = await totalRevenues(parseDateF,parseDateT,req.query.user_id);
        const daily_sales = await dailySales(parseDateF,parseDateT,req.query.user_id);
        const numDays = await getNumDays(parseDateF,parseDateT);

        const stats = { 
            count_days: numDays, 
            count_orders: cnt_orders.count_orders, 
            count_order_items: cnt_orders.count_order_items, 
            count_succ_orders: total_revenues.count_succ_orders, 
            count_succ_order_items: total_revenues.count_succ_order_items, 
            expected_sales: total_revenues.order_received, 
            revenues: total_revenues.order_payment, 
            sales_variance: total_revenues.order_received - total_revenues.order_payment,
            avg_daily_sales: daily_sales.avg_daily_sales, 
            daily_sales: daily_sales.orders, 
            orders: total_revenues.orders
        };
        return BaseResponse.Success(res, `Stats Summary ${parseDateF} - ${parseDateT}`, { data: stats });
    }
    async getOrdersCount(req,res){
        if(!req.query.date) return BaseResponse.BadResponse(res, "Date From is required");
        const { date } = req.query;
        const parseDateF = moment(date).format('YYYY-MM-DD');
        let parseDateT = parseDateF;
        if(req.query.dateto) parseDateT = moment(req.query.dateto).format('YYYY-MM-DD');
        const cnt_orders = await countOrders(parseDateF,parseDateT);
        const numDays = await getNumDays(parseDateF,parseDateT);
        return BaseResponse.Success(res, `Total Orders ${parseDateF} - ${parseDateT}`, { data: { 
                                                                                                count_orders: cnt_orders.count_orders, 
                                                                                                count_order_items: cnt_orders.count_order_items, 
                                                                                                count_days: numDays 
                                                                                            } });
    }
    
    async getDailySales(req,res){
        if(!req.query.date) return BaseResponse.BadResponse(res, "Date From is required");
        const { date } = req.query;
        const parseDateF = moment(date).format('YYYY-MM-DD');
        let parseDateT = parseDateF;
        if(req.query.dateto) parseDateT = moment(req.query.dateto).format('YYYY-MM-DD');
        const daily_sales = await dailySales(parseDateF,parseDateT);
        const numDays = await getNumDays(parseDateF,parseDateT);
        return BaseResponse.Success(res, `Avg. Daily Sales ${parseDateF} - ${parseDateT}`, { data: { 
                                                                                                    daily_sales: daily_sales.orders , 
                                                                                                    count_days: numDays 
                                                                                                } });
    }
    
    async getAvgDailySales(req,res){
        if(!req.query.date) return BaseResponse.BadResponse(res, "Date From is required");
        const { date } = req.query;
        const parseDateF = moment(date).format('YYYY-MM-DD');
        let parseDateT = parseDateF;
        if(req.query.dateto) parseDateT = moment(req.query.dateto).format('YYYY-MM-DD');
        const daily_sales = await dailySales(parseDateF,parseDateT);
        const numDays = await getNumDays(parseDateF,parseDateT);
        return BaseResponse.Success(res, `Avg. Daily Sales ${parseDateF} - ${parseDateT}`, { data: { 
                                                                                                        avg_daily_sales: daily_sales.avg_daily_sales, 
                                                                                                        count_days: numDays 
                                                                                                    } });
    }
    async getTotalRevenues(req,res){
        if(!req.query.date) return BaseResponse.BadResponse(res, "Date From is required");
        const { date } = req.query;
        const parseDateF = moment(date).format('YYYY-MM-DD');
        let parseDateT = parseDateF;
        if(req.query.dateto) parseDateT = moment(req.query.dateto).format('YYYY-MM-DD');
        const total_revenues = await totalRevenues(parseDateF,parseDateT);
        const numDays = await getNumDays(parseDateF,parseDateT);
        const stats = { 
            count_days: numDays, 
            count_succ_orders: total_revenues.count_succ_orders, 
            count_succ_order_items: total_revenues.count_succ_order_items, 
            expected_sales: total_revenues.order_received, 
            revenues: total_revenues.order_payment, 
            sales_variance: total_revenues.order_received - total_revenues.order_payment,
            orders: total_revenues.orders
        };
        return BaseResponse.Success(res, `Total Revenues ${parseDateF} - ${parseDateT}`, { data: stats });
    }

    async summaryOrders(req, res, next) {
        try {
            const {is_merchant} = req.user;
            const {start_date, end_date, status} = req.query;
            const validator = StatsRequestValidator.validateSummaryOrders({start_date, end_date, status});
            if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
                errors: validator.error
            });

            const filters = {
                status,
                start: start_date,
                end: end_date,
            }

            // Add query for count merchant's order
            if (is_merchant) {
                const merchant = req.user.merchants[0];
                const merchantProducts = await ProductService.getProducts({
                    raw: true,
                    attributes: ['id'],
                    where: {
                        merchant_id: merchant.id,
                    }
                });

                const productIds = merchantProducts.map(item => item.id);
                filters.include = [
                    {
                        model: db.models.order_items,
                        as: 'order_items',
                        attributes: ['product_id'],
                        where: {
                            product_id: {
                                [Op.in]: productIds,
                            }
                        }
                    }
                ];
                filters.distinct = true;
            }
            
            const orders = await OrderService.summaryOrder(filters);

            const data = orders.map(o => {
                const {createdAt, count} = o;
                const date = moment(createdAt).format('DD/MM');
                return [date, count.toString()];
            });

            return BaseResponse.Success(res, 'Orders statistic', { data });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }

    // async getDailySales(req,res){
        
    // }
    // async getOrders(req,res){

    // }
    // async getSales(req,res){

    // }
    // async getRevenues(req,res){

    // }
}

module.exports = new StatsHandler;
