const db = require('../../configs/sequelize');
const SettingsValidator = require('../../validators/settings');
const SettingsService = require('../../services/settings.service');

class SettingsHandler {
  async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.findAll({
        include: ['category'],
      });

      return BaseResponse.Success(res, 'Get settings successfully', { data: settings });

    } catch (err) {
      console.log('get settings: ', err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async createSettings(req, res, next) {
    try {
      const validator = SettingsValidator.validateAddSetting(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;

      const setting = await SettingsService.createSetting({
        data: formData,
      });

      return BaseResponse.Success(res, 'create setting successfully.', { data: setting });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateSetting(req, res , next) {
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const validator = SettingsValidator.validateUpdateSetting(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const setting = await SettingsService.findOne({
        where: {
          id,
        }
      });

      if (!setting) {
        return BaseResponse.BadRequest(res, 'Not found.');
      }

      const formData = validator.data;
      const updated = await setting.update(formData);
      return BaseResponse.Success(res, 'Update setting successfully.', { data: updated });

    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new SettingsHandler();
