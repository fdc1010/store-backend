const RoleValidator = require('../../validators/role');
const db = require('../../configs/sequelize');

const ROLES = async () => {
  return await db.models.roles.findAll().then(roles => { return  });
}

class RoleHandler {
  async getRoles(req, res) {
    const roles = await db.models.roles.findAll();
    return BaseResponse.Success(res, 'Get Role Success', {
      roles
    });
  }

  async addRole(req, res) {
    const validator = RoleValidator.validateAddRole(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const role = await db.models.roles.create({
      name: formData.name,
      status: 1
    });

    return BaseResponse.Success(res, 'Add Role Success', {
      role: role.toJSON()
    });
  }

  async updateRoles(req, res) {
    const validator = RoleValidator.validateUpdateRole(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const roleId = req.params.roleId;
    const formData = validator.data;

    const role = await db.models.roles.update({
      name: formData.name
    }, {
      where: {
        id: roleId
      }
    });

    return BaseResponse.Success(res, 'Update Role Success');
  }
}

module.exports = new RoleHandler;
module.exports.ROLES = ROLES;