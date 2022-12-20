const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../configs/sequelize');
const { SPINWHEEL_SETTING_STATUS } = require('../configs');
const SpinControlService = require('./spin-control.service');

class SpinwheelSettingsService {
  constructor() {
    this.Model = db.models.spinwheel_settings;
  }

  async bulkCreate(params, options = {}) {
    return this.Model.bulkCreate(params, {...options});
  }

  async getSpinwheelSettingsBySpinControl({spinId, filter = {}, ...options}) {
    const defaultWhereClause = {
      spinwheel_id: spinId,
      status: SPINWHEEL_SETTING_STATUS.ACTIVE,
    };

    let whereClause = defaultWhereClause;
    if (filter.where) {
      whereClause = {
        ...defaultWhereClause,
        ...filter.where,
      };
    }
    return this.Model.findAll({
      where: whereClause,
      ...options,
    });
  }
}

module.exports = new SpinwheelSettingsService();
