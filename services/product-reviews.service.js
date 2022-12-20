const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../configs/sequelize');

class ProductReviewService {
  constructor() {
    this.Model = db.models.product_reviews;
  }

  async findAll({where, ...options}) {
    return this.Model.findAll({
      where,
      ...options,
    });
  }
}

module.exports = new ProductReviewService();
