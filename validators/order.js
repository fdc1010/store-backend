const Joi = require('joi');
const CustomValidator = require('./custom-validator');

class OrderValidator extends CustomValidator {
  validateListOrder(req) {
    const Schema = Joi.object({
      shipping_address: Joi.string(),
      session_id: Joi.string()
        .required(),
      
      status: Joi.array()
        .optional(),
      
      type: Joi.string()
        .optional()
        .valid('past', 'current')
    })
    
    if (!req.user) return this.validateSchemaOnQuery(Schema, req);
    return {
      success: true,
      data: {}
    }
  }
  
  validateRefund(req) {
    const Schema = Joi.object({
      message: Joi.string()
        .required()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateUploadOrderDelivery(req) {
    try {
      const file = req.files.file;
      if (!file) throw new Error('"file" field is required')
      if (!['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'].includes(file.mimetype)) throw new Error('File must be xlsx');
      
      return {
        success: true,
        data: req.files
      }
    } catch (e) {
      return {
        success: false,
        message: e.message
      }
    }
  }
}

module.exports = new OrderValidator();
