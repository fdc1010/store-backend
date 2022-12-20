const db = require("../configs/sequelize");

class UserAddressService {
  constructor() {
    this.Model = db.models.user_addresses;
  }

  async getById({id, ...options}) {
    return this.Model.findOne({
      where: {
        id,
      },
      ...options
    });
  }
}

module.exports = new UserAddressService();
