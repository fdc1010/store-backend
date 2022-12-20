const {Op} = require('sequelize');

const db = require("../configs/sequelize");

class SettingsService {
  constructor() {
    this.Model = db.models.settings;
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

  async createSetting({ data, options }) {
    return this.Model.create({ ...data }, {...options});
  }

  async updateSetting(data, options) {
    console.log('options: ', options);
    return this.Model.update({ ...data }, { ...options });
  }
}

module.exports = new SettingsService();
