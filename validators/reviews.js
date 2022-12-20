"use strict";

const Joi = require('joi'),
    CustomValidator = require('./custom-validator');

class ReviewsValidator extends CustomValidator {
    constructor() {
        super();
        this.AddSchema = Joi.object({
            order_id: Joi.number().required(),
            product_id: Joi.number().required(),
            order_item_id: Joi.number().required(),
            score: Joi.number(),
            variant: Joi.string().required(),
            comment: Joi.string().allow(null, '')
        });
        
        this.EditSchema = Joi.object({
            id: Joi.number().required(),
            score: Joi.number(),
            comment: Joi.string().allow(null, '')
        });
    }

    validateFiles(req) {
        const { images, video } = req.files || {};
        if (images) {
            if (Array.isArray(images)) {
                // Check if there is file not image
                const error = images.find(img => !(img.mimetype.match('image/*') || img.mimetype.match('application/octet-stream')) );
                if (error) {
                    throw new Error('Uploaded image should be in images format.');
                }
            } else {
                if ( !(images.mimetype.match('image/*') || images.mimetype.match('application/octet-stream'))) {
                    throw new Error('Uploaded image should be in images format.');
                }
            }
        }

        if (video) {
            if (Array.isArray(video)) {
                // Check if there is file not video
                const error = video.find(v => !(v.mimetype.match('video/*') || v.mimetype.match('application/octet-stream')) );
                if (error) {
                    throw new Error('Uploaded video should be in video format.');
                }
            } else {
                if ( !(video.mimetype.match('video/*') || video.mimetype.match('application/octet-stream'))) {
                    throw new Error('Uploaded video should be in video format.');
                }
            }
        }
    }

    validateAddReviews(req) {
        try {
            this.validateFiles(req);
            return this.validateSchema(this.AddSchema, req, req.files);

        } catch (e) {
            return {
                success: false,
                message: e.message
            }
        }
    }

    validateEditReviews(req) {
        try {
            this.validateFiles(req);
            return this.validateSchema(this.EditSchema, req, req.files);

        } catch (e) {
            return {
                success: false,
                message: e.message
            }
        }
    }
}

module.exports = new ReviewsValidator();
