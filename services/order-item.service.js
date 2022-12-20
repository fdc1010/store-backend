const {Op} = require('sequelize');
const moment = require('../configs/moment')

const db = require("../configs/sequelize");

class OrderItemService {
  constructor() {
    this.Model = db.models.order_items;
  }
  async updateOrderItemStatusByOrder({ orderId, status, where = {}, ...options }) {
    const defaultWhereClause = {
      order_id: orderId,
    };

    let whereClause = {
      ...defaultWhereClause,
      ...where
    }
    
    return this.Model.update({ status }, {
      where: whereClause,
      ...options,
    });
  }

  async getOrderItems({where, ...options}) {
    return this.Model.findAll({
      where,
      ...options
    });
  }

  async updateOrderItems({data, where, ...options}) {
    return this.Model.update(data, {
      where,
      ...options
    });
  }
}

module.exports = new OrderItemService();
