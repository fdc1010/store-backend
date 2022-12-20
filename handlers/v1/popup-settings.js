"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const UUID = require('uuid');
const gcs = require('../../configs/gcs');

const StrHelper = require('../../utils/str');
const db = require('../../configs/sequelize');

const Pagination = require('../../utils/pagination');

const { POPUP_SETTINGS_STATUS } = require('../../configs');
const moment = require('../../configs/moment');
const PopupSettingValidator = require('../../validators/popup-settings');
const PopupSettingsService = require('../../services/popup-settings.service');

class PopupSettingHandler {
  async getPopupSettings(req, res, next) {
    try {
      const { status } = req.query;
      let whereClause = {
        status: {
          [Op.in]: [1,2],
        }
      };
      if (status) {
        whereClause.status = status;
      }

      return await Pagination.paging(req, res, db.models.popup_settings, {where: whereClause} );
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async createPopupSetting(req, res, next) {
    try {
      const validator = await PopupSettingValidator.validateAddSetting(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      const uuid = UUID.v4();
      // image
      const file_image = formData.files.banner;
      const destinationPath_image = `popup/banner-${uuid}${StrHelper.getFileExtension(file_image.name)}`;
      const uploadedFile_image = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(file_image.tempFilePath, {
          destination: destinationPath_image
      });

      const banner_url = uploadedFile_image[0].publicUrl();
      const pointSetting = await PopupSettingsService.create({
        data: { ...formData, banner_url }
      });

      return BaseResponse.Success(res, 'Popup Setting Successfully Created', {
        data: pointSetting
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updatePopupSetting(req, res, next) {
    try {
      const {id} = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const popup = await PopupSettingsService.findOne({
        where: {
          id,
        }
      });

      if (!popup) {
        return BaseResponse.BadRequest(res, 'Not found.');
      }

      const validator = await PopupSettingValidator.validateUpdateSetting(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      if (formData.files && formData.files.banner) {
        // Remove old image
        if (popup.banner_url) {
          const temp_image = popup.banner_url.replace(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/popup/`, '');
          const prev_destinationPath_image = `popup/${temp_image}`;
          if (await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).exists()) {
              await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).delete();
          }
        }

        // Create new image on cloud
        const uuid = UUID.v4();
        const file_image = formData.files.banner;
        const destinationPath_image = `popup/banner-${uuid}${StrHelper.getFileExtension(file_image.name)}`;
        const uploadedFile_image = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(file_image.tempFilePath, {
          destination: destinationPath_image
        });
        formData.banner_url = uploadedFile_image[0].publicUrl();
      }

      const updatedPopup = await popup.update({
        ...formData,
      });

      return BaseResponse.Success(res, 'Popup Setting Successfully Upated', {
        data: updatedPopup
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getPopupSetting(req, res, next) {
    try {
      const {id} = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const popup = await PopupSettingsService.findOne({
        where: {
          id,
        }
      });

      return BaseResponse.Success(res, 'Get popup success', { data: popup || null });
    } catch(err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async removePopupSetting(req, res, next) {
    try {
      const {id} = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const popup = await PopupSettingsService.findOne({
        where: {
          id,
        }
      });

      if (!popup) {
        return BaseResponse.BadRequest(res, 'Not found.');
      }

      await PopupSettingsService.update({
        data: {
          status: POPUP_SETTINGS_STATUS.DELETED,
        },
        where: {
          id,
        }
      });

      return BaseResponse.Success(res, 'Remove popup success', {
        data: {
          ...popup.toJSON(),
          status: POPUP_SETTINGS_STATUS.DELETED
        }
      });
    } catch(err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getActivePopup(req, res, next) {
    try {
      const now = moment();
      const activePopup = await PopupSettingsService.findOne({
        where: {
          status: POPUP_SETTINGS_STATUS.ACTIVE,
          publish_date_from: {
            [Op.lte]: now.toDate(),
          },
          publish_date_to: {
            [Op.gte]: now.toDate(),
          },
        }
      });

      return BaseResponse.Success(res, 'Get active popup', { data: activePopup || null });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async changeStatus(req, res, next) {
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const popup = await PopupSettingsService.findOne({
        where: {
          id
        }
      });

      if (!popup) {
        return BaseResponse.BadResponse(res, 'Not found.');
      }

      const validator = await PopupSettingValidator.validateChangeStatus(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      const { status } = formData;

      // If change status to active
      // Disable all active other popups
      if (status === POPUP_SETTINGS_STATUS.ACTIVE) {
        // Find all active popup
        const activePopups = await PopupSettingsService.findAll({
          where: {
            status: POPUP_SETTINGS_STATUS.ACTIVE,
          },
        });

        const ids = activePopups.map(item => item.id);

        // Disable all active popup
        await PopupSettingsService.update({
          data: {
            status: POPUP_SETTINGS_STATUS.DISABLED,
          },
          where: {
            id: {
              [Op.in]: ids,
            },
          },
        });
      }

      popup.status = status;
      await popup.save();

      return BaseResponse.Success(res, 'Active popup success.', { data: popup });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new PopupSettingHandler();

