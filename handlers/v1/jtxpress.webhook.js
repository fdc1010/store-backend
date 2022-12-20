const {Op} = require('sequelize');

const db = require("../../configs/sequelize");

const moment = require('../../configs/moment');

const path = require('path');
const fs = require('fs');

const { ORDER_STATUS } = require('../../configs');
const OrderService = require('../../services/orders.service');


class JTExpressWebhookHandler {
  constructor() {
    this.LOG_FILE_PATH = path.join(__dirname, '../../logs/jtpress.log');
    console.log('log file tpath: ', this.LOG_FILE_PATH);
    this.EVENT_TYPE = {
      CANCELLED: 'CANCELLED',
      FAILED_PICKUP: 'FAILED_PICKUP',
      PARCEL_LOST: 'PARCEL_LOST',
      ARRIVED_AT_HUB: 'ARRIVED_AT_HUB',
      OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      FAILED_DELIVERY: 'FAILED_DELIVERY',
      DELIVERED: 'DELIVERED',
      RETURNED_TO_HUB: 'RETURNED_TO_HUB',
      RETURNED_TO_SENDER: 'RETURNED_TO_SENDER',
      ASSIGNED_PICKUP: 'ASSIGNED_PICKUP',
      PENDING_PICKUP: 'PENDING_PICKUP',
      ACCEPTED_PICKUP: 'ACCEPTED_PICKUP',
      ENROUTE_TO_HUB: 'ENROUTE_TO_HUB',
      RESCHEDULE_DELIVER: 'RESCHEDULE_DELIVER',
      FORWARDED_TO_SHIPPING_PARTNER: 'FORWARDED_TO_SHIPPING_PARTNER',
      SCHEDULED_RTS: 'SCHEDULED_RTS',
      FAILED_RTS: 'FAILED_RTS',
      OUT_FOR_RTS: 'OUT_FOR_RTS',
      PARCEL_DISPOSED: 'PARCEL_DISPOSED',
      PARCEL_LEAKAGE: 'PARCEL_LEAKAGE',
      PARCEL_DAMAGED: 'PARCEL_DAMAGED',
    }
  }

  async receiveHook(req, res, next) {
    try {
      console.log('receive qxpress webhook at: ', moment().toString());
      console.log('jtexpress webhook_info: ', req.body);
      fs.appendFileSync(this.LOG_FILE_PATH, `\n===========START===================\n`);
      fs.appendFileSync(this.LOG_FILE_PATH, `receive jtexpress webhook at: ${moment().toString()}`);
      fs.appendFileSync(this.LOG_FILE_PATH, `\njtexpress webhook_info: ${JSON.stringify(req.body)}`);
      const { status, ...data } = req.body;
      const { tracking_id, reference_number } = data;
      let orderId = null;
      if (reference_number) {
        orderId = reference_number.split('BMart ')[1];
      }
      const order = await OrderService.getSingleOrder({
        where: {
          [Op.or]: [
            {
              id: orderId || +reference_number || null,
            },
            {
              delivery_order_ref: tracking_id,
            }
          ]
        }
      });

      if (!order) {
        console.log('Cannot find order with these info: ', JSON.stringify({ tracking_id, reference_number }));
        fs.appendFileSync(this.LOG_FILE_PATH, `\nCannot find order with these info: ${JSON.stringify({ tracking_id, reference_number })}`);
        fs.appendFileSync(this.LOG_FILE_PATH, `\n===========END===================\n`);
        return res.sendStatus(200);
      }

      switch(status) {
        case this.EVENT_TYPE.FAILED_PICKUP: {
          order.status = ORDER_STATUS.FAILED_PICKUP;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.FAILED_PICKUP}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Order pickup failed',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.PARCEL_LOST: {
          order.status = ORDER_STATUS.PARCEL_LOST;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.PARCEL_LOST}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Order parcel lost',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.ARRIVED_AT_HUB: {
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Items arrived at hub',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.OUT_FOR_DELIVERY: {
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Order out for delivery',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.FAILED_DELIVERY: {
          const { no_of_attempts, comments } = data;
          const note = {
            no_of_attempts,
            comments,
          };

          order.status = ORDER_STATUS.FAILED_DELIVERY;
          order.note = JSON.stringify(note);
          await order.save();

          await db.models.order_items.update({status: ORDER_STATUS.FAILED_DELIVERY}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Order delivery failed',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.DELIVERED: {
          // if (order.status !== ORDER_STATUS.SHIPPED) {
          //   break;
          // }

          order.status = ORDER_STATUS.COMPLETED;
          await order.save();

          await db.models.order_items.update({status: 4}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Order successfully received',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.RETURNED_TO_HUB: {
          order.status = ORDER_STATUS.RETURNED_TO_HUB;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.RETURNED_TO_HUB}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Items return to hub',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.RETURNED_TO_SENDER: {
          order.status = ORDER_STATUS.RETURNED_TO_SENDER;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.RETURNED_TO_SENDER}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Items return to sender',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.ASSIGNED_PICKUP: {
          order.status = ORDER_STATUS.ASSIGNED_PICKUP;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.ASSIGNED_PICKUP}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Assigned pickup',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.PENDING_PICKUP: {
          order.status = ORDER_STATUS.PENDING_PICKUP;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.PENDING_PICKUP}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Pending pickup',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.ACCEPTED_PICKUP: {
          order.status = ORDER_STATUS.ACCEPTED_PICKUP;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.ACCEPTED_PICKUP}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Accepted pickup',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.ENROUTE_TO_HUB: {
          order.status = ORDER_STATUS.ENROUTE_TO_HUB;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.ENROUTE_TO_HUB}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Enroute to hub',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.RESCHEDULE_DELIVER: {
          order.status = ORDER_STATUS.RESCHEDULE_DELIVER;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.RESCHEDULE_DELIVER}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Reschedule deliver',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.FORWARDED_TO_SHIPPING_PARTNER: {
          order.status = ORDER_STATUS.FORWARDED_TO_SHIPPING_PARTNER;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.FORWARDED_TO_SHIPPING_PARTNER}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Forwarded to shipping partner',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.SCHEDULED_RTS: {
          order.status = ORDER_STATUS.SCHEDULED_RTS;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.SCHEDULED_RTS}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Scheduled RTS',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.FAILED_RTS: {
          order.status = ORDER_STATUS.FAILED_RTS;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.FAILED_RTS}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Failed RTS',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.OUT_FOR_RTS: {
          order.status = ORDER_STATUS.OUT_FOR_RTS;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.OUT_FOR_RTS}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Out for RTS',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.PARCEL_DISPOSED: {
          order.status = ORDER_STATUS.PARCEL_DISPOSED;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.PARCEL_DISPOSED}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Parcel disposed',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.PARCEL_LEAKAGE: {
          order.status = ORDER_STATUS.PARCEL_LEAKAGE;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.PARCEL_LEAKAGE}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Parcel leakage',
            type: 0
          });
          break;
        }
        case this.EVENT_TYPE.PARCEL_DAMAGED: {
          order.status = ORDER_STATUS.PARCEL_DAMAGED;
          await order.save();
          await db.models.order_items.update({status: ORDER_STATUS.PARCEL_DAMAGED}, {where: {order_id: order.id}});
          await db.models.order_logs.create({
            order_id: order.id,
            title: 'Parcel damaged',
            type: 0
          });
          break;
        }
        default: {
          // Do nothing for now
        }
      }

      fs.appendFileSync(this.LOG_FILE_PATH, `\n===========END===================\n`);

      res.sendStatus(200);
    } catch (err) {
      fs.appendFileSync(this.LOG_FILE_PATH, `\njtexpress webhook err: ${err.toString()}`);
      fs.appendFileSync(this.LOG_FILE_PATH, `\n===========END===================\n`);
      console.log('jtexpress webhook err: ', err);
      res.sendStatus(200);
    }
  }
}

module.exports = new JTExpressWebhookHandler();
