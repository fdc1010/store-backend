const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../configs/sequelize');
const { SPIN_CONTROL_STATUS } = require('../configs');


class UserPointService {
  constructor() {
    this.Model = db.models.user_points;
  }

  async create(params) {
    return this.Model.create(params);
  }

  async getCalculatedPoints({ used_points, user_id }) {
    let user = await db.models.users.findOne({
      attributes: [ 'id', 'name', 'email', 'points', 'invest_points', 'updated_at' ],
      where: { id: user_id }
    })

    let temp_need_store_points = 0;
    let invest_points = user.invest_points;
    let store_points = user.points;

    if (used_points >= invest_points) {
      temp_need_store_points = used_points - invest_points;
      invest_points = 0;
    } else {
      invest_points = invest_points - used_points;
    }
    
    // add log user_store_invest_points here
    // 
    // ====================

    // add log user_points here
    // 
    // ====================
    
    user.invest_points = invest_points;
    user.points = temp_need_store_points >= store_points ? 0 : store_points - temp_need_store_points;

    await user.save();

    return user;
  }
}

module.exports = new UserPointService();
