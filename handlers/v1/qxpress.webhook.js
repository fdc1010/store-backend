const {Op} = require('sequelize');

const db = require("../../configs/sequelize");

const moment = require('../../configs/moment');

const path = require('path');
const fs = require('fs');

const { ORDER_STATUS } = require('../../configs');
const QxpressService = require('../../services/delivery.service');
const OrderService = require('../../services/orders.service');

// Tracking Status>>
// "N1" : "Order Created",
// "AI": "Transferred to Delivery Partner",
// "AO": "Delivery Partner Assigned",
// "D0": "Delivery pending at the dispatch center",
// "D1": "Order Created",
// "D2": "Arrived at the Processing Facility",
// "D3": "Starting Delivery to Recipient",
// "D4": "Delivered",
// "DA": "Delivery Order Cancelled",
// "DX": "Delivery Attempt Failed",
// "P1": "Pickup Request Received",
// "P2": "Pickup Confirmed",
// "P3": "Pickup Done",
// "PF": "Pickup Failed",
// "PX": "Pickup Cancelled",
// "RE": "Pickup Reassigned",
// "RT": "Returned to Shipper",
// "DP": "Disposed",
// "SA": "Arrived at the Distribution Center",
// "SI": "Starting Delivery to the Destination Country",
// "FS": "Failed Store",
// "LK": "Long Keep in Failed Store",
// "DH": "Delivery Hold",
// "CR": "Clearance Rejection",
// "C1": "Waiting for the Shipper's approval for the volume weight"
// "P0": "Pickup Pending",

class QxpressWebhookHandler {
  constructor() {
    this.LOG_FILE_PATH = path.join(__dirname, '../../logs/qxpress.log');
    this.EVENT_TYPE = {
      DELIVERIED: 'D4',
      PICKUP_DONE: 'P3',
      STARTING_TO_DELIVERY_TO_RECIPIENT: 'D3',
      DELIVERY_ORDER_CANCELED: 'DA',
      PICKUP_FAIL: 'PF',
    }
  }

  async receiveHook(req, res, next) {
    try {
      console.log('receive qxpress webhook at: ', moment().toString());
      console.log('qxpress webhook_info: ', req.body);
      fs.appendFileSync(this.LOG_FILE_PATH, `\n===========START===================\n`);
      fs.appendFileSync(this.LOG_FILE_PATH, `receive qxpress webhook at: ${moment().toString()}`);
      fs.appendFileSync(this.LOG_FILE_PATH, `\nqxpress webhook_info: ${JSON.stringify(req.body)}`);
      const { StatusCode, ...data} = req.body;
      const { TrackingNo, PackingNo, RefOrderNo } = data;
      let orderId = null;
      if (RefOrderNo) {
        orderId = RefOrderNo.split('BMart ')[1];
      }
      const order = await OrderService.getSingleOrder({
        where: {
          [Op.or]: [
            {
              id: orderId || null
            },
            {
              delivery_order_ref: TrackingNo,
            }
          ]
        }
      });

      if (!order) {
        console.log('Cannot find order with these info: ', JSON.stringify({ TrackingNo, PackingNo, RefOrderNo }));
        fs.appendFileSync(this.LOG_FILE_PATH, `\nCannot find order with these info: ${JSON.stringify({ TrackingNo, PackingNo, RefOrderNo })}`);
        fs.appendFileSync(this.LOG_FILE_PATH, `\n===========END===================\n`);
        return res.sendStatus(200);
      }

      switch(StatusCode) {
        case this.EVENT_TYPE.DELIVERIED: {
          if (order.status !== ORDER_STATUS.SHIPPED) {
            break;
          }

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
        case this.EVENT_TYPE.STARTING_TO_DELIVERY_TO_RECIPIENT: {

        }
        default: {
          // Do nothing for now
        }
      }

      fs.appendFileSync(this.LOG_FILE_PATH, `\n===========END===================\n`);

      res.sendStatus(200);
    } catch (err) {
      fs.appendFileSync(this.LOG_FILE_PATH, `\nqxpress webhook err: ${err.toString()}`);
      fs.appendFileSync(this.LOG_FILE_PATH, `\n===========END===================\n`);
      console.log('qxpress webhook err: ', err);
      res.sendStatus(200);
    }
  }
}

module.exports = new QxpressWebhookHandler();
