"use strict";

const { object } = require('joi');
const Joi = require('joi');
const CustomValidator = require('./custom-validator');
const {ValidationError} = require('joi');

class ProductValidator extends CustomValidator {
    async validateAddProduct(req) {
        const checkVariant = async (variant, ctx) => {
            try{
                console.log("variant",variant);
                if(variant && typeof variant !== "undefined"){
                    const variant_value = JSON.parse(variant);
                    if(variant_value.length > 0){
                        let hasError = false;
                        variant_value.map(elem =>{
                            if(!elem.name || typeof elem.name === "undefined") hasError = true;
                            if(elem.name && typeof elem.name !== 'string') hasError = true;
                            // if(!elem.qty || typeof elem.qty === "undefined") hasError = true;
                            // if(elem.qty && !Array.isArray(elem.qty)) hasError = true;
                            // if(!elem.price || typeof elem.price === "undefined") hasError = true;
                            // if(elem.price && !Array.isArray(elem.price)) hasError = true;
                            // if(!elem.value || typeof elem.value === "undefined") hasError = true;
                            // if(elem.value && !Array.isArray(elem.value)) hasError = true;
                        });

                        if (hasError) {
                            throw new ValidationError('Invalid Variant Contents', [{
                                message: "Variant requires valid name as string and value as array. Please use param for variant (name,value) only!",
                                type: 'any.exist',
                                context: {
                                ...ctx
                                }
                            }]);
                        }
                    }
                }
            }catch(err){
                throw new ValidationError('Invalid Variant Contents', [{
                    message: `Variant requires valid name as string and value as array. Please use param for variant (name,value) only! ${err.message}`,
                    type: 'array.exist',
                    context: {
                    ...ctx
                    }
                }]);
            }
        }

        const Schema = Joi.object({
            delivery_id: Joi.number(),
            category_id: Joi.number().required().messages({'number.base': 'Select the category'}),
            brand_id: Joi.number().required().messages({'number.base': 'Select the brand'}),
            merchant_id: Joi.number(),
            name: Joi.string().required(),
            email: Joi.string().email().optional().allow(null, ''),
            variant: Joi.any().external(checkVariant).optional().allow(null, ''),
            description: Joi.string(),
            start_date: Joi.date(),
            end_date: Joi.date(),
            retail_price: Joi.number().min(0).required(),
            sell_price: Joi.number().min(0).required(),
            available_qty: Joi.number().optional().allow(null, '', 0),
            phone_code: Joi.string()
              .regex(/^[+]\d{2}$/)
              .messages({
                  'string.pattern.base': 'Phone code is invalid'
              })
              .default('+65').optional().allow(null, ''),
            phone_number: Joi.string()
              .regex(/^[0-9]{7,15}$/im)
              .messages({
                  'string.pattern.base': 'Phone number is invalid'
              }).optional().allow(null, ''),
            // phone_number: Joi.string().regex(/^[+]*[0-9]{7,15}$/im)
            // phone_number: Joi.string().length(11).required().error(new Error('phone number should be 11 digits long')),
            type: Joi.number().integer().required(),
            is_going_crowd_funding: Joi.bool().optional(),
            service_value: Joi.number().optional(),
            above_service_value_not_going_message: Joi.string().optional(),
            above_service_value_going_message: Joi.string().optional(),
            below_service_value_not_going_message: Joi.string().optional(),
            message_text_popup: Joi.string().optional(),
            bundle_deal: Joi.array()
                .items(Joi.object())
                .optional(),
            video_url: Joi.string()
                .optional()
                .allow(null, ''),
        });

        try {
            let vals = req.files ? Object.values(req.files) : null;
            const { bundle_deal } = req.body;
            if (bundle_deal) {
                const parsed = typeof bundle_deal === 'string' ? JSON.parse(bundle_deal) : bundle_deal;
                req.body.bundle_deal = parsed;
            }
            if(vals && typeof vals[0].length !== "undefined" && vals[0].length >= 1){
                for(let f of vals[0]){
                    let file = f;
                    const product_assets = typeof file !== "undefined" ? file : NULL;

                    if (!product_assets) throw new Error('Provide at least 1 product images');
                    if (!(product_assets.mimetype.match('image/*') ||
                        product_assets.mimetype.match('application/octet-stream'))
                    ) throw new Error('product asset must be an image');
                }
                return this.validateSchemaAsync(Schema, req, req.files);
            } else if(vals && vals.length >= 1){
                // This case is when product only has one 1 image
                const file = vals[0];
                const product_assets = typeof file !== "undefined" ? file : NULL;

                    if (!product_assets) throw new Error('Provide at least 1 product images');
                    if (!(product_assets.mimetype.match('image/*') ||
                        product_assets.mimetype.match('application/octet-stream'))
                    ) throw new Error('product asset must be an image');
                return this.validateSchemaAsync(Schema, req, req.files);
            }

            throw new Error('Provide at least 1 product images');

          } catch (e) {
            return {
              success: false,
              message: e.message
            }
          }
    }

    async validateUpdateProduct(req) {
        
        const checkVariant = async (variant, ctx) => {
            try{
                console.log("variant",variant);
                if(variant && typeof variant !== "undefined"){
                    const variant_value = JSON.parse(variant);
                    if(variant_value.length > 0){
                        let hasError = false;
                        console.log("variant_value.length",variant_value.length);
                        variant_value.map(elem =>{
                            if(!elem.name || typeof elem.name === "undefined") hasError = true;
                            if(elem.name && typeof elem.name !== 'string') hasError = true;
                            // if(!elem.qty || typeof elem.qty === "undefined") hasError = true;
                            // if(elem.qty && !Array.isArray(elem.qty)) hasError = true;
                            // if(!elem.price || typeof elem.price === "undefined") hasError = true;
                            // if(elem.price && !Array.isArray(elem.price)) hasError = true;
                        });

                        if (hasError) {
                            throw new ValidationError('Invalid Variant Contents', [{
                                message: "Variant requires valid name as string and value as array. Please use param for variant (name,value) only!",
                                type: 'any.exist',
                                context: {
                                ...ctx
                                }
                            }]);
                        }
                    }
                }
            }catch(err){
                throw new ValidationError('Invalid Variant Contents', [{
                    message: `Variant requires valid name as string and value as array. Please use param for variant (name,value) only! ${err.message}`,
                    type: 'any.exist',
                    context: {
                    ...ctx
                    }
                }]);
            }
        }

        const Schema = Joi.object({
            delivery_id: Joi.number(),
            category_id: Joi.number().required().messages({'number.base': 'Select the category'}),
            brand_id: Joi.number().required().messages({'number.base': 'Select the brand'}),
            merchant_id: Joi.number(),
            start_date: Joi.date().optional(),
            end_date: Joi.date().optional(),
            name: Joi.string().required(),
            email: Joi.string().email().optional().allow(null, ''),
            variant: Joi.any().allow(null, '').optional(),//.external(checkVariant),
            description: Joi.string(),
            retail_price: Joi.number().min(0).required(),
            sell_price: Joi.number().min(0).required(),
            available_qty: Joi.number().optional().allow(null, '', 0),
            phone_code: Joi.string()
              .regex(/^[+]\d{2}$/)
              .messages({
                  'string.pattern.base': 'Phone code is invalid'
              })
              .default('+65').optional().allow(null, ''),
            phone_number: Joi.string()
              .regex(/^[0-9]{7,15}$/im)
              .messages({
                  'string.pattern.base': 'Phone number is invalid'
              }).optional().allow(null, ''),
            // phone_number: Joi.string().regex(/^[+]*[0-9]{7,15}$/im)
            // phone_number: Joi.string().length(11).required().error(new Error('phone number should be 11 digits long')),
            type: Joi.number().integer().required(),
            is_going_crowd_funding: Joi.bool().optional(),
            service_value: Joi.number().optional(),
            above_service_value_not_going_message: Joi.string().optional(),
            above_service_value_going_message: Joi.string().optional(),
            below_service_value_not_going_message: Joi.string().optional(),
            message_text_popup: Joi.string().optional(),
            bundle_deal: Joi.array()
                .items(Joi.object())
                .optional(),
            video_url: Joi.string()
                .optional()
                .allow(null, ''),
        });

        try {
            let vals = req.files ? Object.values(req.files) : null;
            const { bundle_deal } = req.body;
            if (bundle_deal) {
                const parsed = typeof bundle_deal === 'string' ? JSON.parse(bundle_deal) : bundle_deal;
                req.body.bundle_deal = parsed;
            }
            if(vals && typeof vals[0].length !== "undefined" && vals[0].length > 0){
                for(let f of vals[0]){
                    let file = f;
                    const product_assets = typeof file !== "undefined" ? file : NULL;
                    if (!product_assets) throw new Error('Provide product images');
                    if (!(product_assets.mimetype.match('image/*') ||
                        product_assets.mimetype.match('application/octet-stream'))
                    ) throw new Error('product asset must be an image');
                }
                return this.validateSchemaAsync(Schema, req, req.files);
            }else if(vals && vals.length > 0){
                let file = vals[0];
                const product_assets = typeof file !== "undefined" ? file : NULL;
                if (!product_assets) throw new Error('Provide product images');
                if (!(product_assets.mimetype.match('application/pdf') ||
                    product_assets.mimetype.match('image/*') ||
                    product_assets.mimetype.match('application/octet-stream'))
                ) throw new Error('product asset must be pdf or image');

                return this.validateSchemaAsync(Schema, req, req.files);
            }

            return this.validateSchemaAsync(Schema, req);

          } catch (e) {
            return {
              success: false,
              message: e.message
            }
          }

          return this.validateSchemaAsync(Schema, req, req.files);
    }

    validateUploadVideo(req) {
        try {
            const Schema = Joi.object();
            let vals = req.files ? Object.values(req.files) : null;

            if (!vals || !vals.length) {
                throw new Error('Provide video');
            }

            if ( vals && vals.length > 0 ){
                let file = vals[0];
                const video = typeof file !== "undefined" ? file : NULL;
                if (!video) throw new Error('Provide video');
                if (!(video.mimetype.match('video/*') ||
                    video.mimetype.match('application/octet-stream'))
                ) throw new Error('video must be video');

                return this.validateSchema(Schema, req, req.files);
            }
        } catch (e) {
            return {
                success: false,
                message: e.message
            }
        }
    }

    async validateUpdateRecommnededProduct(req) {
        const schema = Joi.object({
            product_id: Joi.number().required(),
            is_recommended: Joi.number().required().valid(0,1),
        });
        return this.validateSchemaAsync(schema, req);
    }

    async validateUpdateHotProduct(req) {
        const schema = Joi.object({
            product_id: Joi.number().required(),
            is_hot: Joi.number().required().valid(0,1),
        });
        return this.validateSchemaAsync(schema, req);
    }

    async validateUpdatePopularProduct(req) {
        const schema = Joi.object({
            product_id: Joi.number().required(),
            is_popular: Joi.number().required().valid(0,1),
        });
        return this.validateSchemaAsync(schema, req);
    }

    async validateUpdateNewProduct(req) {
        const schema = Joi.object({
            product_id: Joi.number().required(),
            is_new: Joi.number().required().valid(0,1),
        });
        return this.validateSchemaAsync(schema, req);
    }

    async validateUpdateTopProduct(req) {
        const schema = Joi.object({
            product_id: Joi.number().required(),
            is_top: Joi.number().required().valid(0,1),
        });
        return this.validateSchemaAsync(schema, req);
    }
}

module.exports = new ProductValidator;
