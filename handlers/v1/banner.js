"use strict";
const UUID = require('uuid');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const BannerValidator = require('../../validators/banner');
const gcs = require('../../configs/gcs');
const StrHelper = require('../../utils/str');
const Pagination = require('../../utils/pagination');
const { BANNER_STATUS } = require('../../configs');
const moment = require('../../configs/moment');

class BannerHandler {
    async getPreviewBanner(req, res) {
        let { limit = 10 } = req.query;
        const now = moment();
        await db.models.banners.findAll({
            where: {
                status: BANNER_STATUS.ACTIVE,
                publish_date_from: {
                    [Op.lte]: now.toDate(),
                },
                publish_date_to: {
                    [Op.gte]: now.toDate(),
                }
            },
            limit: parseInt(limit),
            order: [
                ['id', 'DESC']
            ]
        }).then(banners => {
            if (banners) return BaseResponse.Success(res, 'Banner Lists', { data: banners });
            return BaseResponse.BadResponse(res, 'Banner Lists Data Empty');
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        });
    }

    // auth
    async getAllBanner(req, res) {
        const { status, title } = req.query;
        const where = {};
        // const clause = req.query.title ? { 
        //     where: {
        //         title: {
        //             [Op.like]: `%${req.query.title}%`
        //         }
        //     } 
        // } : {};
        if (status) {
            where.status = status;
        }

        if (title) {
            where.title = {
                [Op.like]: `%${req.query.title}%`,
            }
        }
        
        return await Pagination.paging(req, res, db.models.banners, { where },null, "Successfully Retrieved Banner Lists");
    }

    async getBanner(req, res) {
        await db.models.banners.findOne({
            where: { id: req.query.banner_id }
        }).then( banner => {
            if (banner) return BaseResponse.Success(res, 'Banner Data Found', { data: banner });
            return BaseResponse.BadResponse(res, 'Banner Data Not Found');
        }).catch(err => {
            return BaseResponse.BadResponse(res, err.message);
        });
    }

    async addBanner(req, res) {

        const validator = BannerValidator.validateAddBanner(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const uuid = UUID.v4();

        
        // image
        const file_image = formData.files.image;
        const destinationPath_image = `banner/banner-${uuid}${StrHelper.getFileExtension(file_image.name)}`;
        const uploadedFile_image = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(file_image.tempFilePath, {
            destination: destinationPath_image
        });
        // image_mobile (if null, default will file_image)
        let file_image_mobile = formData.files.image_mobile;
        let destinationPath_image_mobile = null;
        let uploadedFile_image_mobile = null;
        if ( formData.files.image_mobile ) {
            destinationPath_image_mobile = `banner/banner-mobile-${uuid}${StrHelper.getFileExtension(file_image_mobile.name)}`;
            uploadedFile_image_mobile = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(file_image_mobile.tempFilePath, {
                destination: destinationPath_image_mobile
            });
        }

        
        const image = uploadedFile_image[0];        

        const image_mobile = uploadedFile_image_mobile ? uploadedFile_image_mobile[0] : null;

        const banner = await db.models
            .banners
            .create({
                date_created: new Date(),
                title: formData.title,  
                description: formData.description,
                url: formData.url,
                image: image.publicUrl(),
                image_mobile: image_mobile ? image_mobile.publicUrl() : image.publicUrl(),
                caption1: formData.caption1,
                caption2: formData.caption2,
                caption3: formData.caption3,
                homepage_title: formData.homepage_title,
                publish_date_from: formData.publish_date_from,
                publish_date_to: formData.publish_date_to,
                url_mobile: formData.url_mobile,
                redirect_type: formData.redirect_type,
                redirect_ref_id: formData.redirect_ref_id,
            })

        return BaseResponse.Success(res, 'Banner successfully Added', {
            data: banner
        });
    }

    async updateBanner(req, res) {
        let banner = await db.models.banners.findOne({
            where: { id: req.query.banner_id }
        })

        if (!banner) return BaseResponse.BadResponse(res, 'Banner Not Found');

        const validator = BannerValidator.validateUpdateBanner(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const uuid = UUID.v4();

        if ( formData.files && formData.files.image ) {
            const new_file_image = formData.files.image;
            const new_destinationPath_image = `banner/banner-${uuid}${StrHelper.getFileExtension(new_file_image.name)}`;
            const new_uploadedFile_image = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(new_file_image.tempFilePath, {
                destination: new_destinationPath_image
            });
            const image = new_uploadedFile_image[0];

            // delete old image

            formData.image = image.publicUrl();
        }
        if ( formData.files && formData.files.image_mobile ) {
            const new_file_image_mobile = formData.files.image_mobile;
            const new_destinationPath_image_mobile = `banner/banner-mobile-${uuid}${StrHelper.getFileExtension(new_file_image_mobile.name)}`;
            const new_uploadedFile_image_mobile = await gcs.bucket(process.env.GCS_BUCKET_NAME).upload(new_file_image_mobile.tempFilePath, {
                destination: new_destinationPath_image_mobile
            });
            const image_mobile = new_uploadedFile_image_mobile[0];

            formData.image_mobile = image_mobile.publicUrl();
        }

        let updatedBanner = await db.models.banners.findOne({
            where: { id: req.query.banner_id }
        })

        await updatedBanner.update(formData)
                .then(async (updatedBanner) => {
                    // delete old image
                    if (formData.files && formData.files.image && banner.image) {
                        const temp_image = banner.image.replace(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/banner/`, '');
                        const prev_destinationPath_image = `banner/${temp_image}`;
                        if (await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).exists()) {
                            await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).delete();
                        }
                    }
                    // delete old image_mobile
                    if (formData.files && formData.files.image_mobile && banner.image_mobile) {
                        const temp_image_mobile = banner.image_mobile.replace(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/banner/`, '');
                        const prev_destinationPath_image_mobile = `banner/${temp_image_mobile}`;
                        if (await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image_mobile).exists()) {
                            await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image_mobile).delete();
                        }
                    }

                    return BaseResponse.Success(res, 'Banner successfully Updated', {
                        data: updatedBanner
                    });
                }).catch(err => {
                    return BaseResponse.BadResponse(res, err.message);
                });
    }
    
    async deleteBanner(req, res) {
        const banner = await db.models.banners.findOne({
            where: { id: req.body.banner_id }
        });

        if (!banner) return BaseResponse.BadResponse(res, 'Banner Data Not Found');
        // delete image & image mobile on storage
        return await banner.destroy()
            .then(async(banner_deleted) => {
                if (banner_deleted.image) {
                    const temp_image = banner.image.replace(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/banner/`, '');
                    const prev_destinationPath_image = `banner/${temp_image}`;
                    if (await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).exists()) {
                        await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image).delete();
                    }
                }

                if (banner_deleted.image_mobile) {
                    const temp_image_mobile = banner.image_mobile.replace(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/banner/`, '');
                    const prev_destinationPath_image_mobile = `banner/${temp_image_mobile}`;
                    if (await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image_mobile).exists()) {
                        await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prev_destinationPath_image_mobile).delete();
                    }
                }
        
                return BaseResponse.Success(res, 'Banner successfully deleted', { data: banner_deleted });
            }).catch(err => {
                return BaseResponse.BadResponse(res, err.message);
            });
    }

    async changeBannerStatus(req, res, next) {
        try {
            const { status } = req.body;
            const { id } = req.params;
            if (!status || !id) {
                return BaseResponse.BadResponse(res, 'Missing params.');
            }

            
            const banner = await db.models.banners.findOne({
                where: { id }
            });

            if (!banner) {
                return BaseResponse.BadResponse(res, 'Not found');
            }

            banner.status = status;
            await banner.save();

            return BaseResponse.Success(res, 'Update successfully.', { data: banner });
        } catch (err) {
            return BaseResponse.BadResponse(res, err.message);
        }
    }
}

module.exports = new BannerHandler;
