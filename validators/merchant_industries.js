const Joi = require('joi');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const CustomValidator = require('./custom-validator');

const { MERCHANT_INDUSTRY_STATUS } = require('../configs');
const MerchantIndustriesService = require('../services/merchant_industries.service');

class MerchantIndustriesValidator extends CustomValidator {
  constructor() {
    super();

    const checkUniqueName = async (name, ctx) => {
      const industry = await MerchantIndustriesService.findOne({
        where: {
          name,
          status: {
            [Op.ne]: MERCHANT_INDUSTRY_STATUS.REMOVED,
          }
        }
      });

      if (industry && ctx.id !== industry.id) {
        throw new Joi.ValidationError(`${name} is existed`, [{
          message: `${name} is existed`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const externalValidation = async (data, ctx) => {
      const { name, status, id } = data;
      await checkUniqueName(name, {...ctx, id});
    }

    this.newMerchantIndustrySchema = Joi.object({
      name: Joi.string()
        .max(32)
        .required(),
      status: Joi.number()
        .optional()
        .allow(null, ''),
    }).external(externalValidation);

    this.updateMerchantIndustrySchema = this.newMerchantIndustrySchema.keys({
      id: Joi.number()
        .required(),
      image_url: Joi.string()
        .optional()
        .allow(null, ''),
    });
  }

  async validateAdd(req) {
    // Parse data as json from req body.
    const image = (req.files && req.files.image) ? req.files.image : null;
    if ( !image) throw new Error('"Image" field is required' )
    if ( 
      !(image.mimetype.match('image/*') ||
      image.mimetype.match('application/octet-stream'))
    ) {
      throw new Error('"Image" field must be image"');
    }

    return this.validateSchemaAsync(this.newMerchantIndustrySchema, req, req.files);
  }

  async validateUpdate(req) {
    const image = (req.files && req.files.image) ? req.files.image : null;
    if ( image &&
      !(image.mimetype.match('image/*') ||
        image.mimetype.match('application/octet-stream'))
    ) {
      throw new Error('"image" field must be image"');
    }
    return this.validateSchemaAsync(this.updateMerchantIndustrySchema, req, req.files);
  }
}

module.exports = new MerchantIndustriesValidator();
