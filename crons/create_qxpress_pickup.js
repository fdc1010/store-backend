const {Op} = require('sequelize');
const CronJob = require('cron').CronJob;

const moment = require('../configs/moment');

const { ORDER_STATUS } = require('../configs');

const OrderService = require('../services/orders.service');
const QxpressService = require('../services/delivery.service');
const MerchantService = require('../services/merchant.service');
const QxpressPickupService = require('../services/qxpess_pickup.service');



const createQxpressPickup = async () => {
  try {
    console.log('Start create qxpress pickup');
    const now = moment();
    const start = moment().hour(17).minute(0).second(0).subtract(1, 'd');
    const end = moment().hour(16).minute(59).second(59);
    console.log('start: ', start);
    console.log('end: ', end);

    const orders = await OrderService.getOrders({
      where: {
        status: ORDER_STATUS.SHIPPED,
        updated_at: {
          [Op.and]: {
            [Op.gte]: start.toDate(),
            [Op.lte]: end.toDate(),
          }
        },
      },
    });

    const orderByMerchant = orders.reduce((results, order) => {
      const { merchant_id } = order;
      if (!results[merchant_id]) {
        results[merchant_id] = {
          orders: [],
        };
      }

      const { orders } = results[merchant_id];

      results[merchant_id].orders = [...orders, order];
      return results;
    }, {});

    const merchantsIds = Object.keys(orderByMerchant);
    const merchants = await MerchantService.getMerchants({
      where: {
        id: {
          [Op.in]: merchantsIds
        }
      },
      options: {
        include: ['user'],
      }
    });

    merchants.forEach(m => {
      const {id} = m;
      orderByMerchant[id].merchant = m;
    });

    const pickupDate = now.add(1, 'd').format('YYYY-MM-DD');
    const datum = Object.values(orderByMerchant);
    let i = 0;
    for (i; i < datum.length; i ++) {
      const { merchant, orders } = datum[i];
      const data = QxpressService.parsePickupOrder({
        pickupDate,
        merchant,
        orders,
      });

      const pickupOrder = await QxpressService.createPickupOrder(data);
      const qxpressPickupLog = {
        start_at: now.toDate(),
        total_orders: orders.length,
        from_date: start.toDate(),
        to_date: end.toDate(),
        order_refs: orders.map(o => o.id).join(','),
        merchant_id: merchant.id,
        pickup_no: pickupOrder.ResultMsg,
      }

      await QxpressPickupService.create({
        data: qxpressPickupLog,
      });
    }

    console.log('END create qxpress pickup');
  } catch (err) {
    // Log err
    console.log('create Qxpress pickup err: ', err);
  }
}

const job = new CronJob(
	'00 00 17 * * *',
  // '*/5 * * * * *',
	createQxpressPickup,
	null,
	false,
	'Asia/Singapore'
);

module.exports = job;
