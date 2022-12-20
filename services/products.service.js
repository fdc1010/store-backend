const {Op} = require('sequelize');
const db = require("../configs/sequelize");

class ProductService {
  constructor() {
    this.Model = db.models.products;
  }
  async getProducts({where, ...options}) {
    return this.Model.findAll({
      where,
      ...options
    });
  }

  async findOne({where, ...options}) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async update({ data, ...options }) {
    return this.Model.update({ ...data }, { ...options });
  }

  calculateSetterPriceAndStoreFeeAmount({ product, category }) {
    const { sell_price } = product;
    const { fee } = category;
    const storeFeeAmount = +sell_price * +fee / 100;
    return {
      setterPrice: +sell_price - storeFeeAmount,
      storeFeeAmount,
    }
  }
}

module.exports = new ProductService();
