const {Op} = require('sequelize');

const db = require("../configs/sequelize");

class MerchantIndustriesService {
  constructor() {
    this.Model = db.models.merchant_industries;
  }

  async findAll({ where = {}, ...options}) {
    const defaultWhere = {
      status: 1,
    };

    return this.Model.findAll({
      where: {
        ...defaultWhere,
        ...where,
      },
      ...options
    });
  }

  async findOne({ where = {}, ...options }) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async create({ data, ...options }) {
    return this.Model.create({ ...data }, {...options});
  }

  async update({ data, ...options }) {
    return this.Model.update({ ...data }, { ...options });
  }

  async delete({ id, ...options }) {
    return this.Model.delete(id, { ...options });
  }
}

module.exports = new MerchantIndustriesService();
