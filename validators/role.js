const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class RoleValidator extends CustomValidator {
  validateAddRole(req) {
    const Schema = Joi.object({
      name: Joi.string()
        .max(32)
        .required(),
    });

    return this.validateSchema(Schema, req);
  }

  validateUpdateRole(req) {
    return this.validateAddRole(req);
  }
}

module.exports = new RoleValidator;
