const Joi = require('joi');

const CustomValidator = require('./custom-validator');

const { POPUP_SETTINGS_STATUS } = require('../configs');
const PopupSettingsService = require('../services/popup-settings.service');

class PopupSettingValidator extends CustomValidator {
  constructor() {
    super();

    const checkUniqueName = async (name, ctx) => {
      const popupSetting = await PopupSettingsService.findOne({
        where: {
          name,
        }
      });

      if (popupSetting && ctx.id !== popupSetting.id) {
        throw new Joi.ValidationError(`${name} is existed`, [{
          message: `${name} is existed`,
          type: 'any.exist',
          context: {
            ...ctx
          }
        }]);
      }
    }

    const checkActiveStatus = async (status, ctx) => {
      const {id} = ctx;

      if (status === POPUP_SETTINGS_STATUS.ACTIVE) {
        const existedActivePopup = await PopupSettingsService.findOne({
          where: {
            status: POPUP_SETTINGS_STATUS.ACTIVE,
          }
        });

        if (existedActivePopup && existedActivePopup.id !== id) {
          throw new Joi.ValidationError(`There is and active popup with name: ${existedActivePopup.name}. Please disable or remove it firstly`, [{
            message: `There is and active popup with name: ${existedActivePopup.name}. Please disable or remove it firstly`,
            type: 'any.exist',
            context: {
              ...ctx
            }
          }]);
        }
      }
    }

    const externalValidation = async (data, ctx) => {
      const { name, status, id } = data;
      await checkUniqueName(name, {...ctx, id});
      await checkActiveStatus(status, {...ctx, id});
    }

    this.newPopupSettingSchema = Joi.object({
      name: Joi.string()
        .max(32)
        .required(),
      content: Joi.string()
        .required(),
      status: Joi.number()
        .optional(),
      product_id: Joi.number()
        .optional()
        .allow(null, ''),
      type: Joi.number()
        .optional()
        .allow(null, ''),
      data: Joi.object()
        .optional()
        .allow(null, ''),
      publish_date_from: Joi.date()
        .optional()
        .allow(null, ''),
      publish_date_to: Joi.date()
        .optional()
        .allow(null, ''),
    }).external(externalValidation);

    this.updatePopupSettingSchema = this.newPopupSettingSchema.keys({
      id: Joi.number()
        .required(),
    });
  }

  async validateAddSetting(req) {
    // Parse data as json from req body.
    const { data } = req.body;
    if (data) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        req.body.data = parsedData;
      } catch (err) {
        throw err;
      }
    }
    const image = (req.files && req.files.banner) ? req.files.banner : null;
    if ( !image) throw new Error('"banner" field is required' )
    if ( 
      !(image.mimetype.match('image/*') ||
      image.mimetype.match('application/octet-stream'))
    ) {
      throw new Error('"image" field must be image"');
    }

    return this.validateSchemaAsync(this.newPopupSettingSchema, req, req.files);
  }

  async validateUpdateSetting(req) {
    // Parse data as json from req body.
    const { data } = req.body;
    if (data) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        req.body.data = parsedData;
      } catch (err) {
        throw err;
      }
    }

    const image = (req.files && req.files.banner) ? req.files.banner : null;
    if ( image &&
      !(image.mimetype.match('image/*') ||
        image.mimetype.match('application/octet-stream'))
    ) {
      throw new Error('"image" field must be image"');
    }
    return this.validateSchemaAsync(this.updatePopupSettingSchema, req, req.files);
  }

  validateChangeStatus(req) {
    const Schema = Joi.object({
      status: Joi.number()
        .required()
    });

    return this.validateSchema(Schema, req);
  }
}

module.exports = new PopupSettingValidator();
