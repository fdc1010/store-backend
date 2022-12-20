const Joi = require('joi');


const CustomValidator = require('./custom-validator');

class BannerValidator extends CustomValidator {

    validateAddBanner(req) {
        const Schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            url: Joi.string().uri().required(),
            caption1: Joi.string().required(),
            caption2: Joi.string().required(),
            caption3: Joi.string().required() ,
            homepage_title: Joi.string().required(),
            publish_date_from: Joi.date(),
            publish_date_to: Joi.date(),
            url_mobile: Joi.string().uri().required(),
            redirect_type: Joi.number().optional().valid(1,2,3,4),
            redirect_ref_id: Joi.number().optional(),
            status: Joi.number().optional().allow(null, ''),
        })

        try {
            const image = (req.files && req.files.image) ? req.files.image : null;
            if ( !image) throw new Error('"image" field is required' )
            if ( 
                !(image.mimetype.match('image/*') ||
                image.mimetype.match('application/octet-stream'))
            ) 
                throw new Error('"image" field must be image"');

            if (req.files && req.files.image_mobile) {
                const image_mobile = req.files.image_mobile;
                if ( 
                    !(image_mobile.mimetype.match('image/*') ||
                    image_mobile.mimetype.match('application/octet-stream'))
                ) 
                    throw new Error('"image_mobile" field must be image"');
            }
            return this.validateSchema(Schema, req, req.files);
        } catch (e) {
            return {
                success: false,
                message: e.message
            }
        }

    }

    validateUpdateBanner(req) {
        const Schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            url: Joi.string().uri().required(),
            caption1: Joi.string().required(),
            caption2: Joi.string().required(),
            caption3: Joi.string().required() ,
            homepage_title: Joi.string().required(),
            publish_date_from: Joi.date(),
            publish_date_to: Joi.date(),
            url_mobile: Joi.string().uri().required(),
            redirect_type: Joi.number().optional().valid(1,2,3,4),
            redirect_ref_id: Joi.number().optional(),
            status: Joi.number().optional().allow(null, ''),
        })
        try {
            if (req.files && req.files.image) {
                const image = req.files.image;
                if ( !image  ) throw new Error('"image" field can not fill with null value' )
                if ( 
                    !(image.mimetype.match('image/*') ||
                    image.mimetype.match('application/octet-stream'))
                )
                    throw new Error('"image" field must be image"');
            }

            if (req.files && req.files.image_mobile) {
                const image_mobile = req.files.image_mobile;
                if ( !image_mobile  ) throw new Error('"image_mobile" field can not fill with null value' )
                if ( 
                    !(image_mobile.mimetype.match('image/*') ||
                    image_mobile.mimetype.match('application/octet-stream'))
                ) 
                    throw new Error('"image_mobile" field must be image"');
            }
            return this.validateSchema(Schema, req, req.files);
        } catch (e) {
            return {
                success: false,
                message: e.message
            }
        }
        // return this.validateAddBanner(req);
    }
}

module.exports = new BannerValidator;
