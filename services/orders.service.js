const {Op} = require('sequelize');
const moment = require('../configs/moment')

const db = require("../configs/sequelize");
const { ORDER_DELIVERY_TYPE, ORDER_STATUS, NOTIFICATION_TYPE, PAYMENT_METHODS, BMART_FEE } = require('../configs');
const DeliveryService = require('./lalamove.service');
const OrderItemService = require('./order-item.service');
const Notification = require('../handlers/v1/notification');
const { roundDecimal } = require('../utils/number-helper');

class OrderService {
  constructor() {
    this.Model = db.models.orders;
  }

  async getOrders({where = {}, ...options}) {
    return this.Model.findAll({
      where,
      ...options,
    });
  }

  async getSingleOrder({where ={}, ...options}) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async summaryOrder({status, start, end, filters, ...options}) {
    const startDate = moment(start).startOf('day');
    const endDate = moment(end).endOf('day');

    let whereClause = {
      created_at: {
          [Op.and]: [
              {
                  [Op.gte]: startDate.toDate(),
              },
              {
                  [Op.lte]: endDate.toDate(),
              }
          ]
      }
    }

    if (status || +status === 0) {
        whereClause.status = status;
    }

    const attributes = [
        [db.literal('DATE(orders.created_at)'), 'createdAt'],
    ];

    const group = {
        group: ['createdAt']
    };

    return this.Model.count({
      attributes,
      where: whereClause,
      ...options,
      ...group,
      
  });
  }

  async createOrderWithLalamove({
    order,
    quotation,
    fee,
    currency,
  }) {
    const params = {
      quotedTotalFee: {
        amount: fee.toString(),
        currency,
      },
      sms: false,
      ...quotation,
    };

    return DeliveryService.createOrder({params});
  }

  async handleChangeOrderStatus(data) {
    let transaction = null;
    try {
      const {status, id} = data;
      const order = await this.getSingleOrder({
        where: {
          delivery_order_ref: id,
        }
      });

      if (!order) {
        // TODO: Should log order not found.
        return;
      }

      const {previousStatus, shareLink} = data;

      switch(status) {
        case ORDER_DELIVERY_TYPE.ASSIGNING_DRIVER: {
          if (!previousStatus || order.status !== ORDER_STATUS.PROCESSED) {
            return;
          }
          transaction = await db.transaction();
          order.status = ORDER_STATUS.PAYMENT_ACCEPTED;
          await order.save({
            transaction,
          });
    
          const updatedOrderItems = await OrderItemService.updateOrderItemStatusByOrder({
            orderId: order.id,
            status: order.status,
            transaction,
          });

          const order_logs = await db.models.order_logs
            .create({
              order_id: order.id,
              title: 'Driver rejected',
              type: 0
            }, {
              transaction,
            });

          await transaction.commit();
          return;
        }
        case ORDER_DELIVERY_TYPE.ON_GOING: {
          // processed
          if (order.status !== ORDER_STATUS.PAYMENT_ACCEPTED) {
            return;
          }
          order.status = ORDER_STATUS.PROCESSED;

          if (shareLink) {
            order.delivery_share_url = shareLink;
          }

          transaction = await db.transaction();

          await order.save({
            transaction,
          });
    
          const updatedOrderItems = await OrderItemService.updateOrderItemStatusByOrder({
            orderId: order.id,
            status: order.status,
            transaction,
          });
    
    
          const order_logs = await db.models.order_logs
            .create({
              order_id: order.id,
              title: 'Order successfully processed',
              type: 0
            }, {
              transaction,
            });
    
          await transaction.commit();
          return;
        }
        case ORDER_DELIVERY_TYPE.PICKED_UP: {
          // shipped
          const tracking_number = data.id;
          const carrier_code = 'lalamove';

          if (order.status !== ORDER_STATUS.PROCESSED) {
            return;
          }

          transaction = await db.transaction();

          order.status = ORDER_STATUS.SHIPPED;
          await order.save({
            transaction,
          });

          const updatedOrderItems = await OrderItemService.updateOrderItemStatusByOrder({
            orderId: order.id,
            status: order.status,
            transaction,
          });

          const order_logs = await db.models.order_logs
            .create({
              order_id: order.id,
              title: 'Order successfully shipped',
              type: 0
            }, {
              transaction,
            });

          await transaction.commit();
          return;
        }

        case ORDER_DELIVERY_TYPE.COMPLETED: {
          if (order.status !== ORDER_STATUS.SHIPPED) {
            return;
          }

          transaction = await db.transaction();

          order.status = ORDER_STATUS.COMPLETED;
          await order.save({
            transaction,
          });

          const updatedOrderItems = await OrderItemService.updateOrderItemStatusByOrder({
            orderId: order.id,
            status: order.status,
            transaction,
          });

          const order_logs = await db.models.order_logs
            .create({
              order_id: order.id,
              title: 'Order successfully received',
              type: 0
            }, {
              transaction,
            });

          await transaction.commit();
          return;
        }

        case ORDER_DELIVERY_TYPE.EXPIRED:
        case ORDER_DELIVERY_TYPE.REJECTED: {
          // cancled
          if (status === ORDER_DELIVERY_TYPE.REJECTED && order.status !== ORDER_STATUS.PAYMENT_ACCEPTED) {
            return;
          }

          transaction = await db.transaction();
          order.status = ORDER_STATUS.CANCELED;
          order.note = JSON.stringify({reason: 'Driver rejected'}) ;
          await order.save({transaction: transaction});

          const orderItems = await db.models.order_items.findAll({
            where: {
              order_id: order.id,
            },
            include: [{
              model: db.models.products,
              as: 'product',
              attributes: ['available_qty'],
            }],
          })

          for (const item of orderItems) {
            await db.models.products.update({
              available_qty: item.product.available_qty + item.quantity
            }, {
              where: {
                id: item.product_id
              },
              transaction,
            });
            
            await db.models.order_items.update({status: order.status}, {where: {id: item.id}});
          }

          const order_logs = await db.models.order_logs
            .create({
              order_id: order.id,
              title: 'Order canceled by rejected',
              type: 0
            });

          await transaction.commit();
          await Notification.createNotificationOrderUpdates(order.toJSON(), NOTIFICATION_TYPE.ORDER_PLACED, null, "Orders", order_logs.title);
          return;
        }
        default: {
          return;
        }
      }
    } catch (err) {
      if (transaction) {
        transaction.rollback();
      }
      console.log('create order with lalamove err: ', err);
      return;
    }
  }

  async cancelDeliveryOrder(orderRef) {
    return DeliveryService.cancelOrder({ orderRef });
  }

  parsePaymentMethod(rawMethod) {
    switch (rawMethod) {
      case PAYMENT_METHODS.CARD:
        return 'Visa/Master';
      case PAYMENT_METHODS.PAYNOW:
        return 'Paynow';
      default:
        return '';
    }
  }

  calculatePaymentFee(paymentMethod, value) {
    switch(paymentMethod) {
      case PAYMENT_METHODS.PAYNOW:
        if (value > 100) {
          return value * 0.006 + 0.3;
        } else {
          return value * 0.009;
        }
      case PAYMENT_METHODS.CARD:
        return value * 0.028 + 0.5;
      default:
        return 0;
    }
  }

  async refundVoucher({ orderId, ...options}) {
    const order = await this.getSingleOrder({
      where: {
        id: orderId
      }
    });

    const { transaction } = options || {};

    const userVoucher = await db.models.user_vouchers.findOne({
      where: {
        user_id: order.user_id,
        voucher_id: order.voucher_id
      },
    });

    const voucher = await db.models.vouchers.findOne({
      where: {
        id: order.voucher_id,
      }
    });

    if (!userVoucher || !voucher) {
      console.log(`Refund voucher for order: ${order.id} fail.`)
      console.log(`Cannot find user voucher with voucher id ${order.voucher_id} and user_id ${order.user_id}`);
      return;
    }

    userVoucher.amount = userVoucher.amount + 1;
    // voucher.used_count = voucher.used_count - 1;
    if (transaction) {
      await userVoucher.save({ transaction });
      await voucher.save({ transaction });
    } else {
      await userVoucher.save();
      await voucher.save();
    }
  }

  async refundPoints({ orderId, ...options }) {
    try {
      const order = await this.getSingleOrder({
        where: {
          id: orderId
        }
      });
  
      const { transaction } = options || {};
  
      const user = await db.models.users.findOne({
        where: {
          id: order.user_id,
        }
      });
  
      if (!user) {
        console.log(`Refund points for order: ${order.id} fail.`)
        console.log(`Cannot find user with id ${order.user_id}`);
        return;
      }
  
      const { points } = user;
      user.points = points + order.point_used;
      if (transaction) {
        await user.save({ transaction });
      } else {
        await user.save();
      }
    } catch (err) {
      console.log('refund Points err: ', err);
    }
  }

  calculateSettementReportForOrder(order) {
    try {
      const {
        merchant,
        order_items,
        payment_method,
        point_used,
        voucher_discount,
      } = order;
      const created_at = moment(order.created_at).utcOffset(8).format('M/D/YY');
      const merchant_name = (merchant || {}).name;
      const merchant_id = (merchant || {}).id;
      const order_id = order.id;
      let actual_amount = 0;
      let redeem_points_amount = (+point_used || 0) / 1000;;
      let redeem_voucher_amount = +voucher_discount || 0;;
      let store_fee = 0;
      let merchant_amount = 0;
      let merchantJoinFlashDealAmount = 0;
      let marketingJoinFlashDealAmount = 0;
      let totalBMartFeeByFlashDeal = 0;

      const maxShippingFee = Math.max(...order_items.map(item => item.shipping_price));
      let isUsedShippingFee = false;

      order_items.forEach((item) => {
        const result = this.calculateSettementReportForOrderItem(item, maxShippingFee, isUsedShippingFee);
        const {
          total,
          BMartFee,
          netAmountDealToMerchant,
          netAmountMerchantJoinFlashDeal = 0,
          netMarketingFlashDeal = 0,
          BMartFeeByFlashDeal,
          shippingFee,
        } = result;

        actual_amount += +total;
        store_fee += BMartFee;
        merchant_amount += netAmountDealToMerchant;
        merchantJoinFlashDealAmount += netAmountMerchantJoinFlashDeal;
        marketingJoinFlashDealAmount += netMarketingFlashDeal;
        totalBMartFeeByFlashDeal += BMartFeeByFlashDeal;
        if (shippingFee && shippingFee > 0) {
          isUsedShippingFee = true;
        }
      });

      const amount_after_redeemtion = actual_amount - redeem_voucher_amount - redeem_points_amount - marketingJoinFlashDealAmount - totalBMartFeeByFlashDeal;
      const order_payment_method = this.parsePaymentMethod(payment_method || '');
      const payment_fee = roundDecimal(this.calculatePaymentFee(payment_method, amount_after_redeemtion), -2);
      const net_received_from_payment = amount_after_redeemtion - payment_fee;
      const promo_code = order.promo_code || '';

      return {
        created_at,
        merchant_name,
        merchant_id,
        order_id,
        actual_amount,
        redeem_points_amount,
        redeem_voucher_amount,
        store_fee,
        merchant_amount,
        order_payment_method,
        payment_fee,
        net_received_from_payment,
        promo_code,
        amount_after_redeemtion,
        marketingJoinFlashDealAmount,
        merchantJoinFlashDealAmount,
      }
    } catch (err) {
      console.log('err: ', err);
    }
  }

  calculateSettementReportForOrderItem(orderItem, maxShippingFee, isUsedShippingFee) {
    try {
      const { event } = orderItem;
      if (event && event.flashDealAmount) {
        return this.calculateSettementReportForOrderItemHasEvent(orderItem, maxShippingFee, isUsedShippingFee);
      } else {
        return this.calculateSettementReportForOrderItemWithoutEvent(orderItem, maxShippingFee, isUsedShippingFee);
      }
    } catch (err) {
      console.log('order item err: ', err);
      return {
        total: 0,
        BMartFee: 0,
        BMartFeeByFlashDeal: 0,
        netAmountDealToMerchant: 0,
        netAmountMerchantJoinFlashDeal: 0,
        netMarketingFlashDeal: 0,
        shippingFee: 0,
      }
    }
  }

  calculateSettementReportForOrderItemHasEvent(orderItem, maxShippingFee, isUsedShippingFee) {
    try {
      const { quantity, shipping_price, event } = orderItem;
      const { originPrice, flashDealAmount: { adminDiscountValue, merchantDiscountValue, markettingDiscountValue } } = event;
      let shippingFee = shipping_price >= maxShippingFee && !isUsedShippingFee ? shipping_price : 0;
      const total = +(((+originPrice * +quantity) + shippingFee).toFixed(2));
      // const BMartFee = +adminDiscountValue;
      const BMartFee = +((+total * BMART_FEE).toFixed(2)); // 5% Fee based on (ship + item price) * quantity
      const netAmountMerchantJoinFlashDeal = +merchantDiscountValue * +quantity;
      const netMarketingFlashDeal = +markettingDiscountValue * +quantity;
      const netAmountDealToMerchant = total - BMartFee - netAmountMerchantJoinFlashDeal;
      const BMartFeeByFlashDeal = +adminDiscountValue * +quantity;

      return {
        total,
        BMartFee,
        BMartFeeByFlashDeal,
        netAmountDealToMerchant,
        netAmountMerchantJoinFlashDeal,
        netMarketingFlashDeal,
        shippingFee,
      }
    } catch (err) {
      console.log('order item has event err: ', err);
      return {
        total: 0,
        BMartFee: 0,
        BMartFeeByFlashDeal: 0,
        netAmountDealToMerchant: 0,
        netAmountMerchantJoinFlashDeal: 0,
        netMarketingFlashDeal: 0,
        shippingFee: 0,
      }
    }
  }

  calculateSettementReportForOrderItemWithoutEvent(orderItem, maxShippingFee, isUsedShippingFee) {
    try {
      const { item_price, quantity, shipping_price } = orderItem;
      let shippingFee = shipping_price >= maxShippingFee && !isUsedShippingFee ? shipping_price : 0;
      const total = (((+item_price * +quantity) + shippingFee).toFixed(2));
      const BMartFee = total * BMART_FEE;
      const netAmountDealToMerchant = total - BMartFee;

      return {
        total,
        BMartFee,
        BMartFeeByFlashDeal: 0,
        netAmountDealToMerchant,
        netAmountMerchantJoinFlashDeal: 0,
        netMarketingFlashDeal: 0,
        shippingFee,
      }
    } catch (err) {
      console.log('order item without event err: ', err);
      return {
        total: 0,
        BMartFee: 0,
        BMartFeeByFlashDeal: 0,
        netAmountDealToMerchant: 0,
        netAmountMerchantJoinFlashDeal: 0,
        netMarketingFlashDeal: 0,
        shippingFee: 0
      }
    }
  }
}

module.exports = new OrderService();
