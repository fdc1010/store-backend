const {Op} = require('sequelize');
const db = require("../configs/sequelize");
const UUID = require('uuid');

const StrHelper = require('../utils/str');
const { REVIEW_STORAGE_FOLDER, ASSET_FILE_TYPES } = require('../configs');
const StorageService = require('./storage.service');

class ReviewAssetsService {
  constructor() {
    this.Model = db.models.review_assets;
  }

  async findAll({ where = {}, ...options}) {
    return this.Model.findAll({
      where,
      ...options
    });
  }

  async findOne({ where = {}, ...options }) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async create(data, options) {
    return this.Model.create({ ...data }, {...options});
  }

  async update(data, options) {
    return this.Model.update({ ...data }, { ...options });
  }

  async destroy({ where = {}, ...options }) {
    return this.Model.destroy({ where, ...options });
  }

  async uploadAsset({file, destinationPath}) {
    return StorageService.uploadFile({ file, destinationPath });
  }

  async removeAsset(filePath) {
    const prevDestFile = filePath.split(`${process.env.GCS_BUCKET_NAME}/`)[1];
    return StorageService.removeFile(prevDestFile);
  }

  async createAssets(assetFiles = { images: null, video: null }, product, order, transaction, createdReview) {
    // Upload images and video
    const { images, video } = assetFiles || {};
    if (images) {
      // Handle upload images
      const files = Array.isArray(images) ? [...images] : [images];
      for (let file of files) {
        const file_name = `${product.id}-${order.id}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`;
        const destinationPath = `${REVIEW_STORAGE_FOLDER}/${file_name}`
        const uploadedFile = await this.uploadAsset({ file, destinationPath });
        const file_mimetype = file.mimetype.split('/');

        await this.create({
          review_id: createdReview.id,
          file_url: uploadedFile.publicUrl(),
          type: ASSET_FILE_TYPES.IMAGE,
          file_name: file_name,
          file_size: file.size,
          file_extension: file_mimetype[1]
        }, {
          transaction
        });
      }
    }

    if (video) {
      // Handle upload video
      const file_name = `${product.id}-${order.id}-${UUID.v4()}${StrHelper.getFileExtension(video.name)}`;
      const destinationPath = `${REVIEW_STORAGE_FOLDER}/${file_name}`
      const uploadedFile = await this.uploadAsset({ file: video, destinationPath });
      const file_mimetype = video.mimetype.split('/');

      await this.create({
        review_id: createdReview.id,
        file_url: uploadedFile.publicUrl(),
        type: ASSET_FILE_TYPES.VIDEO,
        file_name: file_name,
        file_size: video.size,
        file_extension: file_mimetype[1]
      }, {
        transaction
      });
    }
  }
}

module.exports = new ReviewAssetsService();
