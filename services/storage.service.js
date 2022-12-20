const fs = require('fs');
const UUID = require('uuid');

const gcs = require('../configs/gcs');
const StrHelper = require('../utils/str');

class StorageService {
  constructor() {
    this.StorageClient = gcs;
    this.BUCKET_NAME = process.env.GCS_BUCKET_NAME
  }

  async uploadFile({file, destinationPath}) {
    try {
      // const destinationPath = `banner/${StrHelper.slug(merchant.name)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`
      const uploadedFile = await this.StorageClient.bucket(this.BUCKET_NAME)
        .upload(file.tempFilePath, {
          destination: destinationPath
        });
      

      fs.unlink(file.tempFilePath, () => {
      });

      return uploadedFile[0];
    } catch (err) {
      throw err;
    }
  }

  async removeFile(filePath) {
    return this.StorageClient.bucket(this.BUCKET_NAME).file(filePath).exists().then(async data => {
      if(data[0]) {
        await this.StorageClient.bucket(this.BUCKET_NAME).file(filePath).delete();
        return true;
      }
    });
  }
}

module.exports = new StorageService();
