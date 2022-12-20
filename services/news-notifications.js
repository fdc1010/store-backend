const {Op} = require('sequelize');

const db = require("../configs/sequelize");

class NewsNotificationService {
  constructor() {
    this.Model = db.models.news_notifications;
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

  async create({ data, ...options }) {
    return this.Model.create({ ...data }, {...options});
  }

  async update({ data, ...options }) {
    return this.Model.update({ ...data }, { ...options });
  }
}

module.exports = new NewsNotificationService();
