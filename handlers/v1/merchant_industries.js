const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const UUID = require('uuid');
const gcs = require('../../configs/gcs');
const StrHelper = require('../../utils/str');
const db = require('../../configs/sequelize');

const moment = require('../../configs/moment');
const { MERCHANT_INDUSTRY_STATUS } = require('../../configs');
const MerchantIndustriesValidator = require('../../validators/merchant_industries');
const MerchantIndustriesService = require('../../services/merchant_industries.service');
const Pagination = require('../../utils/pagination');

class MerchantIndustryHandler {
  constructor() {}

  async getMerchantIndustries(req, res, next) {
    try {
      const { status, keyword } = req.query;
      const defaultStatus = [
        MERCHANT_INDUSTRY_STATUS.ACTIVE,
        MERCHANT_INDUSTRY_STATUS.DISABLED,
      ];

      const where = {
        status: {
          [Op.in]: defaultStatus,
        }
      };

      if (status) {
        where.status = Array.isArray(status)
          ? { [Op.in]: status }
          : status
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      return await Pagination.paging(req, res, db.models.merchant_industries, { where } );
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async createMerchantIndustry(req, res, next) {
    try {
      const validator = await MerchantIndustriesValidator.validateAdd(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      const uuid = UUID.v4();
      // image
      const file_image = formData.files.image;
      const destinationPath_image = `industry/image-${uuid}${StrHelper.getFileExtension(file_image.name)}`;
      const uploadedFile_image = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(file_image.tempFilePath, {
        destination: destinationPath_image
      });

      const image_url = uploadedFile_image[0].publicUrl();
      const industry = await MerchantIndustriesService.create({
        data: { ...formData, image_url }
      });

      return BaseResponse.Success(res, 'Merchant industry Successfully Created', {
        data: industry
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateMerchantIndustry(req, res, next) {
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const industry = await MerchantIndustriesService.findOne({
        where: {
          id,
        }
      });

      if (!industry) {
        return BaseResponse.BadRequest(res, 'Not found.');
      }

      const validator = await MerchantIndustriesValidator.validateUpdate(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      if (formData.files && formData.files.image) {
        // Remove old image
        if (industry.image_url) {
          const temp_image = industry.image_url.replace(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/industry/`, '');
          const prev_destinationPath_image = `industry/${temp_image}`;
          if (await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).exists()) {
              await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).delete();
          }
        }

        // Create new image on cloud
        const uuid = UUID.v4();
        const file_image = formData.files.image;
        const destinationPath_image = `industry/image-${uuid}${StrHelper.getFileExtension(file_image.name)}`;
        const uploadedFile_image = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(file_image.tempFilePath, {
          destination: destinationPath_image
        });
        formData.image_url = uploadedFile_image[0].publicUrl();
      }

      const updatedIndustry = await industry.update({
        ...formData,
      });

      return BaseResponse.Success(res, 'Merchant industry Successfully Upated', {
        data: updatedIndustry
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getIndustry(req, res, next) {
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const industry = await MerchantIndustriesService.findOne({
        where: {
          id,
        }
      });

      return BaseResponse.Success(res, 'Get popup success', { data: industry || null });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async deleteMerchantIndustry(req, res, next) {
    try {
      const {id} = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const industry = await MerchantIndustriesService.findOne({
        where: {
          id,
        }
      });

      if (!industry) {
        return BaseResponse.BadRequest(res, 'Not found.');
      }

      await MerchantIndustriesService.update({
        data: {
          status: MERCHANT_INDUSTRY_STATUS.REMOVED,
        },
        where: {
          id,
        }
      });

      return BaseResponse.Success(res, 'Remove industry success', {
        data: {
          ...industry.toJSON(),
          status: MERCHANT_INDUSTRY_STATUS.REMOVED
        }
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new MerchantIndustryHandler();
