const {Op} = require('sequelize');

const db = require("../configs/sequelize");

class ProductInsuranceService {
  constructor() {
    this.Model = db.models.products_insurance;
  }

  async findAll({ where = {}, ...options}) {
    return this.Model.findAll({
      where,
      ...options
    });
  }

  async findOne({ where = {}, ...options }) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async create({ data, options }) {
    return this.Model.create({ ...data }, {...options});
  }

  async update({ data, options }) {
    return this.Model.update({ ...data }, { ...options });
  }

  async upsert({ data, options }) {
    return this.Model.upsert({ ...data }, { ...options });
  }
}

module.exports = new ProductInsuranceService();
