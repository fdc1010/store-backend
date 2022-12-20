const Joi = require('joi');
const {ValidationError} = require('joi');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');

class MerchantValidator extends CustomValidator {
  validateRegisterMerchant(req) {
    const checkEmail = async (email, ctx) => {
      const user = await db.models.users.findOne({
        where: {
          email: email
        }
      })
      
      if (user) {
        throw new ValidationError('Email is already registered', [{
          message: `email "${email}" already exists`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }
    
    const Schema = Joi.object({
      name: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      contact_name: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      password: Joi.string()
        .required()
        .min(3)
        .max(32)
        .optional(),
      
      email: Joi.string()
        .email()
        .required()
        .external(checkEmail),
      
      type: Joi.string()
        .valid("1", "2")
        .required(),
      
      handphone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Handphone code is invalid'
        })
        .default('+65'),
      
      handphone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .messages({
          'string.pattern.base': 'Handphone number is invalid'
        }),
      
      office_phone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Phone code is invalid'
        })
        .default('+65')
        .allow(null, '')
        .optional(),

      office_phone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .messages({
          'string.pattern.base': 'Phone number is invalid'
        })
        .allow(null, '')
        .optional(),
      
      office_address: Joi.string()
        .required(),
      
      acra_number: Joi.number()
        .required(),
      fcm_token: Joi.string().allow(null, ''),
      fcm_topics: Joi.number().optional(),
      website: Joi.string().allow(null, '').optional(),
      facebook: Joi.string().allow(null, '').optional(),
      instagram: Joi.string().allow(null, '').optional(),
      latitude: Joi.string().required(),
      longitude: Joi.string().required(),
      postal_code: Joi.string().required(),
      industry: Joi.number().required(),
    });
    
    try {
      const business_profile = req.files?.business_profile ?? null;
      if (!business_profile) throw new Error('Business profile required');
      if (!(business_profile.mimetype.match('application/pdf') ||
        business_profile.mimetype.match('image/*') ||
        business_profile.mimetype.match('application/octet-stream'))
      ) throw new Error('Business profile must be pdf or image');
      return this.validateSchemaAsync(Schema, req, req.files);
    } catch (e) {
      return {
        success: false,
        message: e.message
      }
    }
  }
  
  validateMerchantVerification(req) {
    const Schema = Joi.object({
      status: Joi.number()
        .valid(1, 2)
        .required()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateEditMerchant(req) {
    const checkEmail = async (email, ctx) => {
      const user = await db.models.users.findOne({
        where: {
          email: email,
          id: {[Op.ne]: req.user_id}
        }
      })
      
      if (user) {
        throw new ValidationError('Email is already registered', [{
          message: `email "${email}" already exists`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }
    
    const Schema = Joi.object({
      user_id: Joi.number(),
      name: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      contact_name: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      email: Joi.string()
        .email()
        .required()
        .external(checkEmail),
      
      type: Joi.string()
        .valid("1", "2")
        .required(),
      
      handphone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Handphone code is invalid'
        })
        .default('+65'),
      
      handphone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .messages({
          'string.pattern.base': 'Handphone number is invalid'
        }),
      
      office_phone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Phone code is invalid'
        })
        .default('+65').allow(null, '').optional(),
      
      office_phone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .messages({
          'string.pattern.base': 'Phone number is invalid'
        }).allow(null, '').optional(),
      
      office_address: Joi.string()
        .required(),
      
      acra_number: Joi.number()
        .required(),
      
      about: Joi.string().allow(null, '').optional(),
      opening_hours: Joi.array().items(Joi.object({
        is_open: Joi.boolean(),
        open_hour: Joi.string().allow(null),
        close_hour: Joi.string().allow(null),
      }).allow(null)).allow(null).length(7),
      website: Joi.string().allow(null, '').optional(),
      facebook: Joi.string().allow(null, '').optional(),
      instagram: Joi.string().allow(null, '').optional(),
      latitude: Joi.string().required(),
      longitude: Joi.string().required(),
      postal_code: Joi.string().required(),
      industry: Joi.number().required(),
    });
    
    try {
      const opening_hours = req.body.opening_hours;
      if (typeof opening_hours === 'string') {
        req.body.opening_hours = JSON.parse(opening_hours);
      }
      if (!req.files) return this.validateSchemaAsync(Schema, req, req.files);
      const business_profile = req.files?.business_profile ?? null;
      if (!business_profile) return this.validateSchemaAsync(Schema, req, req.files);
      if (!(business_profile.mimetype.match('application/pdf') ||
        business_profile.mimetype.match('image/*') ||
        business_profile.mimetype.match('application/octet-stream'))
      ) throw new Error('Business profile must be pdf or image');
      return this.validateSchemaAsync(Schema, req, req.files);
    } catch (e) {
      return {
        success: false,
        message: e.message
      }
    }
  }
  
  validateEditSetting(req) {
    const Schema = Joi.object({
      color_settings: Joi.object({
        primary_color: Joi.string().required(),
        // primary_dark_color: Joi.string().required(),
        // primary_light_color: Joi.string().required(),
        // secondary_color: Joi.string().required(),
        // secondary_light_color: Joi.string().required(),
        // secondary_dark_color: Joi.string().required(),
      })
    });
    
    try {
      const colorSettings = req.body.color_settings;
      if (typeof colorSettings === 'string') {
        req.body.color_settings = JSON.parse(colorSettings);
      }
      if (!req.files) return this.validateSchemaAsync(Schema, req, req.files);
      const banner_image = req.files.banner_image;
      if (!banner_image) return this.validateSchemaAsync(Schema, req, req.files);
      if (!(banner_image.mimetype.match('image.*') ||
        banner_image.mimetype.match('application/octet-stream'))
      ) throw new Error('"banner" field must be image"');
      ;
      return this.validateSchemaAsync(Schema, req, req.files);
    } catch (e) {
      return {
        success: false,
        message: e.message,
      };
    }
  }
  
  validateReplyReview(req) {
    const Schema = Joi.object({
      comment: Joi.string()
        .required(),
    });
    
    return this.validateSchema(Schema, req);
  }
  
}

module.exports = new MerchantValidator;
