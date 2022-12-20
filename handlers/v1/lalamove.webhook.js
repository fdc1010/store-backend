const { DELIVERY_TYPE, ORDER_DELIVERY_TYPE } = require('../../configs');
const LalamoveService = require('../../services/lalamove.service');
const OrderService = require('../../services/orders.service');

class LalamoveWebhookHandler {
  constructor() {
    this.EVENT_TYPE = {
      ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
      ORDER_AMOUNT_CHANGED: 'ORDER_AMOUNT_CHANGED',
      WALLET_BALANCE_CHANGED: 'WALLET_BALANCE_CHANGED',
      ORDER_REPLACED: 'ORDER_REPLACED',
    }
  }

  async receiveHook(req, res, next) {
    try {
      console.log('req.webhook_info: ', req.body);
      const WEBHOOK_INFO = req.body;
      const { timestamp, data } = WEBHOOK_INFO;

      const {time, signature} = LalamoveService.generateSignature({
        method: 'POST',
        path: '/webhook/lalamove',
        body: JSON.stringify(data),
        timestamp,
      });
      
      const verifyResult = signature === WEBHOOK_INFO.signature;
      if (verifyResult) {
        const { eventType } = WEBHOOK_INFO;
        switch(eventType) {
          case this.EVENT_TYPE.ORDER_STATUS_CHANGED: {
            const {order} = data;
            await OrderService.handleChangeOrderStatus(order);
          }
          default: {}
        }
      }

      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(200);
    }
  }
}

module.exports = new LalamoveWebhookHandler();
