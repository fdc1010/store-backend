const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class UserPoints extends CustomValidator {

    validateAddUserPoints(req) {
        const Schema = Joi.object({
          user_id: Joi.number(),
          point_id: Joi.number().required(),
          description: Joi.string(),
        });
    
        return this.validateSchema(Schema, req);
    }
}

module.exports = new UserPoints;
  