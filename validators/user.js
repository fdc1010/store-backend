const Joi = require('joi');
const {ValidationError} = require('joi');
const CustomValidator = require('./custom-validator');
const db = require('../configs/sequelize');

class UserValidator extends CustomValidator {
  validateLogin(req) {
    const Schema = Joi.object({
      email: Joi.string()
        .email()
        .required(),
      
      password: Joi.string()
        .required(),
      fcm_token: Joi.string().allow(null, ''),
      fcm_topics: Joi.number().optional(),
    });
    
    return this.validateSchema(Schema, req);
  }
  
  async validateRegister(req) {
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
      enable_newsletter: Joi.any(),
      name: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      email: Joi.string()
        .email()
        .required()
        .external(checkEmail),
      
      password: Joi.string()
        .required()
        .min(3)
        .max(32),
      fcm_token: Joi.string().allow(null, ''),
      fcm_topics: Joi.number(),
      phone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Phone code is invalid'
        })
        .default('+65')
        .allow(null, '')
        .optional(),

      phone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .messages({
          'string.pattern.base': 'Phone number is invalid'
        })
        .allow(null, '')
        .optional(),
      // password_confirm: Joi.string()
      //   .required()
      //   .equal(Joi.ref('password'))
      //   .messages({
      //     'any.only': 'Password confirmation must be same with password'
      //   }),
      //
      // contact_no: Joi.string()
      //   .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
      //   .messages({
      //     'string.pattern.base': 'Phone number is invalid'
      //   }),
      //
      // gender: Joi.string()
      //   .valid('male', 'female')
      //   .required()
    })
    
    return this.validateSchemaAsync(Schema, req);
  }
  
  validateUpdateName(req) {
    const Schema = Joi.object({
      name: Joi.string()
        .required()
        .min(3)
        .max(32)
        // .regex(/^[a-zA-Z ]+$/)
        .messages({
          'string.pattern.base': 'Name format is invalid'
        }),
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateUpdateGender(req) {
    const Schema = Joi.object({
      gender: Joi.string()
        .valid('male', 'female')
        .required()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateUpdateBirthday(req) {
    const Schema = Joi.object({
      gender: Joi.date()
        .required()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateUpdatePhone(req) {
    const Schema = Joi.object({
      phone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Phone code is invalid'
        })
        .default('+65'),
      phone_number: Joi.string()
        .regex(/^[0-9]{8}$/im)
        .messages({
          'string.pattern.base': 'Phone number is invalid'
        }),
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateUpdatePassword(req) {
    const Schema = Joi.object({
      old_password: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      new_password: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      new_password_confirmation: Joi.string()
        .required()
        .equal(Joi.ref('new_password'))
        .messages({
          'any.only': 'Password confirmation must be same with password'
        }),
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateUpdateAvatar(req) {
    try {
      const avatar = req.files.avatar;
      if (!avatar) throw new Error('"avatar" field is required')
      if (!(avatar.mimetype.match('image.*') || avatar.mimetype.match('application/octet-stream'))) throw new Error('"avatar" field must be image"');
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
  
  validateUpdateBirthDate(req) {
    const Schema = Joi.object({
      birth_date: Joi.date()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateDefaultAddress(req) {
    const Schema = Joi.object({
      default_address: Joi.number()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  // script added by frank
  validateForgotPassword(req) {
    const Schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateResetPassword(req) {
    const Schema = Joi.object({
      
      reset_code: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      email: Joi.string()
        .email()
        .required(),
      
      new_password: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      confirm_new_password: Joi.string()
        .required()
        .equal(Joi.ref('new_password'))
        .messages({
          'any.only': 'Password confirmation must be same with password'
        }),
    });
    
    return this.validateSchema(Schema, req);
  }
  
  validateLoginByToken(req) {
    const Schema = Joi.object({
      token: Joi.string()
        .required(),
      fcm_token: Joi.string().allow(null, ''),
      fcm_topics: Joi.number().optional(),
    });
    
    return this.validateSchema(Schema, req)
  }
  
  // ======================
  
  async validateCreateUser(req) {
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
      enable_newsletter: Joi.any(),
      name: Joi.string()
        .required()
        .min(3)
        .max(32),
        // .regex(/^[a-zA-Z ]+$/),
      
      email: Joi.string()
        .email()
        .required()
        .external(checkEmail),
      
      password: Joi.string()
        .required()
        .min(3)
        .max(32),
      
      role_id: Joi.number()
        .required()
        .valid(1, 2),
      
      phone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Phone code is invalid'
        })
        .default('+65')
        .allow(null, '')
        .optional(),

      phone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .messages({
          'string.pattern.base': 'Phone number is invalid'
        })
        .allow(null, '')
        .optional(),
      // password_confirm: Joi.string()
      //   .required()
      //   .equal(Joi.ref('password'))
      //   .messages({
      //     'any.only': 'Password confirmation must be same with password'
      //   }),
      //
      // contact_no: Joi.string()
      //   .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
      //   .messages({
      //     'string.pattern.base': 'Phone number is invalid'
      //   }),
      //
      // gender: Joi.string()
      //   .valid('male', 'female')
      //   .required()
    })
    
    return this.validateSchemaAsync(Schema, req);
  }
  
  validateUpdateUser(req) {
    const Schema = Joi.object({
      enable_newsletter: Joi.any(),
      name: Joi.string()
        .required()
        .min(3)
        .max(32),
        // .regex(/^[a-zA-Z ]+$/),
      
      password: Joi.string()
        .min(3)
        .max(32)
        .optional()
        .empty('')
        .default(null),
      
      role_id: Joi.number()
        .valid(1, 2, 3),
      
      birth_date: Joi.date(),
  
      phone_code: Joi.string()
        .regex(/^[+]\d{2}$/)
        .messages({
          'string.pattern.base': 'Phone code is invalid'
        })
        .optional()
        .allow(null, ''),
        // .default('+65'),
      phone_number: Joi.string()
        .regex(/^[0-9]{7,15}$/im)
        .optional()
        .allow(null, '')
        .messages({
          'string.pattern.base': 'Phone number is invalid'
        }),
      
      gender: Joi.string()
        .valid('male', 'female')
    })
    
    return this.validateSchema(Schema, req);
  }
  
  validateExportUser(req) {
    const Schema = Joi.object({
      start: Joi.date().optional(),
      end: Joi.date().optional(),
      type: Joi.number().valid(1, 2, 3),
      authorization: Joi.string().optional()
    })
    
    return this.validateSchemaOnQuery(Schema, req);
  }
}

module
  .exports = new UserValidator;
