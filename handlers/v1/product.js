"use strict";
const UUID = require('uuid');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const StrHelper = require('../../utils/str');
const gcs = require('../../configs/gcs');
const Pagination = require('../../utils/pagination');
const ProductValidator = require('../../validators/product');
const NotificationHandler = require('../../handlers/v1/notification');
const ProductHelper = require('../../utils/product-helper');
const date = require('date-and-time');
const ProductsService = require('../../services/products.service');
const EventItemsService =require('../../services/event_items.service');
const moment = require('../../configs/moment');

const PRODUCT = {
  STATUS_INACTIVE: 0,
  STATUS_PENDING: 1,
  STATUS_APPROVED: 2,
  STATUS_REJECTED: 3,
  STATUS_LIVE: 4,
  STATUS_DRAFT: 5
}; // Added be frank
const PRODUCT_STATUSES = ['Inactive', 'Pending', 'Approved', 'Rejected', 'Live', 'Draft']; // Added be frank
const EXCLUDE_DRAFT_FIELDS = ['phone_number', 'email', 'phone_code', 'phone_number', 'start_date', 'end_date', 'variant', 'bundle_deal', 'video_url'];

const { PRODUCT_TYPES, DEFAULT_CROWDFUND_AVAILABLE_VALUE, EVENT_TYPES, EVENT_STATUS, EVENT_ITEM_STATUS } = require('../../configs');

const SettingsService = require('../../services/settings.service');
const ProductCrowdfundService = require('../../services/products-crowdfund.service');
const ProductInsuranceService = require('../../services/products-insurance.service');
class ProductHandler {
  async getAllProducts(req, res) {
    return await Pagination.paging(req, res, db.models.products, {});
  }

  async getFilterProductListAdmin(req, res) {
    let clause = {};
    clause.where = {};
    if (req.query.status) {
      switch (parseInt(req.query.status)) {
        case PRODUCT.STATUS_INACTIVE :
          clause.where = {status: PRODUCT.STATUS_INACTIVE};
          break;
        case PRODUCT.STATUS_PENDING :
          clause.where = {status: PRODUCT.STATUS_PENDING};
          break;
        case PRODUCT.STATUS_APPROVED :
          clause.where = {status: PRODUCT.STATUS_APPROVED};
          break;
        case PRODUCT.STATUS_REJECTED :
          clause.where = {status: PRODUCT.STATUS_REJECTED};
          break;
        case PRODUCT.STATUS_LIVE :
          clause.where = {status: PRODUCT.STATUS_LIVE};
          break;
        case PRODUCT.STATUS_DRAFT :
          clause.where = {status: PRODUCT.STATUS_DRAFT};
          break;
        default:
          break;
      }
    }

    if (req.user.is_merchant) {
      // console.log(req.user.merchants)
      clause.where.merchant_id = req.user.merchants[0].id;
    }

    const { keyword } = req.query;
    if (keyword) {
      // clause.where.name = { [Op.like]: `%${keyword.trim()}%` };
      clause.where[Op.or] = [
        {
          name: { [Op.like]: `%${keyword.trim()}%` },
        },
        {
          description: { [Op.like]: `%${keyword.trim()}%` },
        }
      ]
    }

    // if (!req.user.is_superadmin) {
    //   const merchant = await db.models.merchants.findOne({
    //     user_id: req.user.id
    //   });
    //   if (clause.where) clause.where.merchant_id = merchant.id;
    //   else {
    //     clause.where = { merchant_id: merchant.id };
    //   }
    // }

    return await Pagination.pagingProduct(req, res, db.models.products, clause);
  }

  async getFilterProductList(req, res) {

    let clause = {
      where: {}
    };

    const merchant_id = req.body.merchant_id;
    // const keyword = req.body.keyword ? '%' + req.body.keyword + '%' : '%%';
    const brand_id_arr = (typeof req.body.brand === 'string' ? JSON.parse(req.body.brand) : req.body.brand) ?? [];
    const category_id_arr = (typeof req.body.category === 'string' ? JSON.parse(req.body.category) : req.body.category) ?? [];
    const { is_hot, is_popular, is_new, is_top } = req.body;
    const keyword = req.body.keyword;
    if (keyword) {
      if (keyword.indexOf('#') === 0) {
        clause.where.description = {[Op.like]: `%${keyword}%`};
      } else {
        clause.where.name = {[Op.like]: `%${keyword}%`};
      }
    }

    if (brand_id_arr && brand_id_arr.length) {
      clause.where.brand_id = {
        [Op.in]: brand_id_arr
      }
    }

    if (category_id_arr && category_id_arr.length) {
      clause.where.category_id = {
        [Op.in]: category_id_arr
      }
    }

    if (merchant_id && !isNaN(+merchant_id)) {
      clause.where.merchant_id = merchant_id;
    }

    if (+is_hot && !isNaN(+is_hot)) {
      clause.where.is_hot = +is_hot;
    }

    if (+is_popular && !isNaN(+is_popular)) {
      clause.where.is_popular = +is_popular;
    }

    if (+is_new && !isNaN(+is_new)) {
      clause.where.is_new = +is_new;
    }

    if (+is_top && !isNaN(+is_top)) {
      clause.where.is_top = +is_top;
    }

    // if (brand_id_arr.length > 0 && category_id_arr.length > 0) {
    //   clause.where = {
    //     [Op.and]: [
    //       {name: {[Op.like]: keyword}},
    //       {category_id: {[Op.in]: category_id_arr}},
    //       {brand_id: {[Op.in]: brand_id_arr}}
    //     ]
    //   };
    // } else if (category_id_arr.length > 0) {
    //   clause.where = {
    //     [Op.and]: [
    //       {name: {[Op.like]: keyword}},
    //       {category_id: {[Op.in]: category_id_arr}}
    //     ]
    //   };
    // } else if (brand_id_arr.length > 0) {
    //   clause.where = {
    //     [Op.and]: [
    //       {name: {[Op.like]: keyword}},
    //       {brand_id: {[Op.in]: brand_id_arr}}
    //     ]
    //   };
    // } else {
    //   clause.where.name = {[Op.like]: keyword};
    // }

    clause.where.status = 2 // Approved product

    let user_id = 0
    if (req.user) user_id = req.user.id;
    else if (req.query.user_id) user_id = parseInt(req.query.user_id);

    if (req.body.merchant_id && !isNaN(req.body.merchant_id)) clause.where.merchant_id = parseInt(req.body.merchant_id,);

    return await Pagination.pagingProduct(req, res, db.models.products, clause, "Successfully Retrieved List(s)", user_id);
  }

  async addProduct(req, res) {
    // if(!req.user.merchants[0]) return BaseResponse.BadResponse(res, 'Only Merchant account can add product!');
    const validator = await ProductValidator.validateAddProduct(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const transaction = await db.transaction();

    if (formData.type && formData.type === PRODUCT_TYPES.NORMAL) {
      if (!formData.variant) {
        return BaseResponse.BadResponse(res, 'Variant is required');
      }
    }

    try {
      const productCount = await db.models.products.max('id');

      const data = {
        name: formData.name,
        email: formData.email,
        code: `P-${StrHelper.padNumber(productCount + 1, 4)}`,
        variant: formData.variant,
        description: formData.description,
        retail_price: formData.retail_price,
        sell_price: formData.sell_price,
        available_qty: formData.available_qty,
        phone_number: `${formData.phone_code} ${formData.phone_number}`,
        delivery_id: formData.delivery_id,
        category_id: formData.category_id,
        brand_id: formData.brand_id,
        merchant_id: formData.merchant_id,
        status: PRODUCT.STATUS_PENDING,
        type: formData.type || PRODUCT_TYPES.NORMAL,
        bundle_deal: formData.bundle_deal,
        video_url: formData.video_url || '',
      };

      // No draft status anymore
      // Object.entries(data).forEach(([key, value]) => {
      //   if (!value && !EXCLUDE_DRAFT_FIELDS.includes(key)) {
      //     data.status = PRODUCT.STATUS_DRAFT;
      //   }
      // });

      const product = await db.models.products.create(
        data,
        {
          transaction
        },
      );

      req.product = product;

      // Check merchant product category
      const merchantCategory = await db.models.merchant_categories.findOne({
        where: {
          merchant_id: formData.merchant_id,
          category_id: formData.category_id
        }
      });
      if(!merchantCategory){
        const merchantCategoryCount = await db.models.merchant_categories.count({
          where: {
            merchant_id: formData.merchant_id,
            category_id: formData.category_id
          }
        })
        await db.models.merchant_categories.create(
          {
            merchant_id: formData.merchant_id,
            category_id: formData.category_id,
            position: merchantCategoryCount + 1
          },
          {
            transaction
          },
        )
      }


      if (formData.type === PRODUCT_TYPES.CROWDFUND) {
        // Save product crowdfund properties
        const {
          is_going_crowd_funding,
          service_value,
          above_service_value_not_going_message,
          above_service_value_going_message,
          below_service_value_not_going_message,
          merchant_id,
        } = formData;

        const productCrowdfundData = {
          is_going_crowd_funding,
          service_value: service_value || DEFAULT_CROWDFUND_AVAILABLE_VALUE,
          above_service_value_not_going_message,
          above_service_value_going_message,
          below_service_value_not_going_message,
          merchant_id,
          product_id: product.id,
        }

        const productCrowdfund = await ProductCrowdfundService.create({
          data: productCrowdfundData,
          options: {
            transaction
          }
        });

      } else if (formData.type === PRODUCT_TYPES.INSURANCE) {
        // Save product insurance properties
        const {
          message_text_popup,
          merchant_id,
          service_value,
        } = formData;

        const productInsuranceData = {
          product_id: product.id,
          message_text_popup,
          service_value,
          merchant_id,
        }

        const productInsurance = await ProductInsuranceService.create({
          data: productInsuranceData,
          options: {
            transaction,
          }
        });
      }

      await transaction.commit();

      return await ProductHelper.saveProductAssets(req, res, transaction)
        .then(async (result) => {
          let user_id = 0;
          if (req.user) user_id = req.user.id;
          else if (req.query.user_id) user_id = parseInt(req.query.user_id);
          const data = await ProductHelper.getFormattedProductData({where: {id: product.id}}, user_id);

          return BaseResponse.Success(res, 'Product add successfully', {data});
        });

    } catch (err) {
      console.log('add produt error: ', err);
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }

  }

  async updateProduct(req, res) {
    let transaction = null;
    try {
      // console.log("req.body.variant",req.body.variant);
      const product = await db.models.products.findOne({
        where: {
          id: req.query.product_id
        }
      });

      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
      if (product && !req.user.is_superadmin && (req.user.merchants[0] && product.merchant_id != req.user.merchants[0].id)) return BaseResponse.UnprocessableEntity(res, "Record don't exist! or You have no access to edit product details");

      const validator = await ProductValidator.validateUpdateProduct(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;

      if (formData.type && formData.type === PRODUCT_TYPES.NORMAL) {
        if (!formData.variant) {
          return BaseResponse.BadResponse(res, 'Variant is required');
        }
      }

      req.product = product;

      const data = {...formData};
      const merchant_id = formData.merchant_id || product.merchant_id;
      data.phone_number = `${formData.phone_code} ${formData.phone_number}`;

      // No draft anymore
      // Object.entries(data).forEach(([key, value]) => {
      //   if ( (value === null || typeof value === 'undefined') && !EXCLUDE_DRAFT_FIELDS.includes(key)) {
      //     data.status = PRODUCT.STATUS_DRAFT;
      //   }
      // });

      // Check merchant product category
      const merchantCategory = await db.models.merchant_categories.findOne({
        where: {
          merchant_id,
          category_id: formData.category_id
        }
      });
      transaction = await db.transaction()
      if(!merchantCategory){
        const merchantCategoryCount = await db.models.merchant_categories.count({
          where: {
            merchant_id,
            category_id: formData.category_id
          }
        })
        await db.models.merchant_categories.create(
          {
            merchant_id,
            category_id: formData.category_id,
            position: merchantCategoryCount + 1
          },
          {
            transaction,
          }
        )
      }

      return await ProductHelper.saveProductAssets(req, res)
        .then(async () => {
          let productRecord = await db.models.products.findOne({
            where: {
              id: product.id
            }
          });

          return productRecord.update(
            data,
            { transaction }
          )
            .then(async (product) => {
              let user_id = 0
              if (req.user) user_id = req.user.id;
              else if (req.query.user_id) user_id = parseInt(req.query.user_id);

              if (product.type === PRODUCT_TYPES.CROWDFUND) {
                // Save product crowdfund properties
                const {
                  is_going_crowd_funding,
                  service_value,
                  above_service_value_not_going_message,
                  above_service_value_going_message,
                  below_service_value_not_going_message,
                } = formData;

                const existedProductCrowdfund = await ProductCrowdfundService.findOne({
                  where: {
                    product_id: product.id,
                  },
                  attributes: ['id'],
                });

                const productCrowdfundData = {
                  is_going_crowd_funding,
                  service_value: service_value || DEFAULT_CROWDFUND_AVAILABLE_VALUE,
                  above_service_value_not_going_message,
                  above_service_value_going_message,
                  below_service_value_not_going_message,
                  merchant_id,
                  product_id: product.id,
                }

                if (existedProductCrowdfund) {
                  productCrowdfundData.id = existedProductCrowdfund.id;
                }

                const productCrowdfund = await ProductCrowdfundService.upsert({
                  data: productCrowdfundData,
                  options: {
                    transaction
                  }
                });

              } else if (product.type === PRODUCT_TYPES.INSURANCE) {
                // Save product insurance properties
                const {
                  message_text_popup,
                  service_value,
                } = formData;

                const existedProductInsurance = await ProductInsuranceService.findOne({
                  where: {
                    product_id: product.id,
                  }
                })

                const productInsuranceData = {
                  product_id: product.id,
                  message_text_popup,
                  service_value,
                  merchant_id,
                }

                if (existedProductInsurance) {
                  productInsuranceData.id = existedProductInsurance.id;
                }

                const productInsurance = await ProductInsuranceService.upsert({
                  data: productInsuranceData,
                  options: {
                    transaction,
                  }
                });
              }

              await transaction.commit();

              const data = await ProductHelper.getFormattedProductData({where: {id: product.id}}, user_id);
              return BaseResponse.Success(res, 'Product successfully updated', {data})
            })
            .catch( async (err) => {
              console.log('update product catch err: ', err);
              if (transaction) {
                await transaction.rollback();
              }
              return BaseResponse.BadResponse(res, err.message);
            });
        });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      console.log('update product err: ', err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getProductView(req, res) {
    try {
      const { admin_view } = req.query;
      if (!req.query.product_id || isNaN(req.query.product_id)) {
        return BaseResponse.BadResponse(res, 'Product Id required is numeric');
      }
      const product = await db.models.products.findOne({
        where: {
          id: parseInt(req.query.product_id)
        }
      });
      if (!product) {
        return BaseResponse.BadResponse(res, 'Product Not Found!');
      }

      let user_id = 0
      if (req.user) {
        user_id = req.user.id;
      }
      else if (req.query.user_id) {
        user_id = parseInt(req.query.user_id);
      }

      const data = await ProductHelper.getFormattedProductData({where: {id: product.id}}, user_id);

      if (!admin_view || !(parseInt(admin_view))) {
        const { view_count } = product;
        product.view_count = view_count + 1;
        product.save();
      }

      return await BaseResponse.Success(res, 'Product Found', {data});
      
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async approveProduct(req, res) {
    const product = await db.models.products.findOne({
      where: {
        id: req.body.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
    if (product && !req.user.is_superadmin) return BaseResponse.UnprocessableEntity(res, "Only Admins can reject product status change request");

    return product.update({status: PRODUCT.STATUS_APPROVED})
      .then(async (product) => {
        let user_id = 0
        if (req.user) user_id = req.user.id;
        else if (req.query.user_id) user_id = parseInt(req.query.user_id);
        const data = await ProductHelper.getFormattedProductData({where: {id: product.id}}, user_id);

        return BaseResponse.Success(res, 'Product Successfully Approved!', {data})
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async rejectProduct(req, res) {
    const product = await db.models.products.findOne({
      where: {
        id: req.body.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
    if (product && !req.user.is_superadmin) return BaseResponse.UnprocessableEntity(res, "Only Admins can reject product status change request");

    return product.update({status: PRODUCT.STATUS_REJECTED})
      .then(async (product) => {
        let user_id = 0
        if (req.user) user_id = req.user.id;
        else if (req.query.user_id) user_id = parseInt(req.query.user_id);
        const data = await ProductHelper.getFormattedProductData({where: {id: product.id}}, user_id);

        return BaseResponse.Success(res, 'Product is Rejected!', {data})
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async setProductStatus(req, res) {
    const status_arr = [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_REJECTED];
    if (status_arr.includes(parseInt(req.body.status))) return BaseResponse.UnprocessableEntity(res, "This API doesn\'t allow you to approve or reject an item. Another API is intended for that.");
    const product = await db.models.products.findOne({
      where: {
        id: req.body.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
    if (product && !req.user.is_superadmin && (req.user.merchants[0] && product.merchant_id != req.user.merchants[0].id)) return BaseResponse.UnprocessableEntity(res, "Record don't exist! or You have no access to edit product details");

    return product.update({status: req.body.status})
      .then(async (product) => {

        const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

        return BaseResponse.Success(res, 'Product status successfully updated', {data})
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async deleteProduct(req, res) {

    const product = await db.models.products.findOne({
      where: {
        id: req.body.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
    if (product && !req.user.is_superadmin && (req.user.merchants[0] && product.merchant_id != req.user.merchants[0].id)) return BaseResponse.UnprocessableEntity(res, "Record don't exist! or You have no access to edit product details");

    const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

    return await product.destroy()
      .then(async (product) => {
        const prod_assets = await db.models.product_assets.findAll({where: {product_id: req.body.product_id}});
        for (let pa of prod_assets) {
          const prevDestFile = `product/${pa.filename}`;
          gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).exists().then(async data => {
            if (data[0]) await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).delete();
          });
        }

        if (product) return BaseResponse.Success(res, 'Product successfully deleted', {data});
        return BaseResponse.BadResponse(res, 'Product Not Found or Product don\'t belong to you therefore not allowing you to delete');
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async softDeleteProduct(req, res) {
    const product = await db.models.products.findOne({
      where: {
        id: req.query.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
    if (product && !req.user.is_superadmin && (req.user.merchants[0] && product.merchant_id != req.user.merchants[0].id)) return BaseResponse.UnprocessableEntity(res, "Record don't exist! or You have no access to edit product details");

    return product.update({status: PRODUCT.STATUS_INACTIVE})
      .then(async (product) => {

        const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

        return BaseResponse.Success(res, 'Product successfully deleted', {data})
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async recommendProduct(req, res) {

    const product = await db.models.products.findOne({
      where: {
        id: req.body.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

    return product.update({is_recommended: 1})
      .then(async (product) => {

        const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

        return BaseResponse.Success(res, 'Product successfully recommended', {data})
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async featureProduct(req, res) {

    const product = await db.models.products.findOne({
      where: {
        id: req.body.product_id
      }
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
    if (product && !req.user.is_superadmin && (req.user.merchants[0] && product.merchant_id != req.user.merchants[0].id)) return BaseResponse.UnprocessableEntity(res, "Record don't exist! or You have no access to edit product details");

    return product.update({is_featured: 1})
      .then(async (product) => {

        const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

        return BaseResponse.Success(res, 'Product successfully updated', {data})
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async setHotProduct(req, res) {
    try {
      const validator = await ProductValidator.validateUpdateHotProduct(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
      const {is_hot} = formData;

      const product = await db.models.products.findOne({
        where: {
          id: req.body.product_id
        }
      })

      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

      return product.update({is_hot})
        .then(async (product) => {

          const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

          return BaseResponse.Success(res, 'Product successfully updated', {data})
        })
        .catch(err => {
          return BaseResponse.BadResponse(res, err.message);
        })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async setPopularProduct(req, res) {
    try {
      const validator = await ProductValidator.validateUpdatePopularProduct(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
      const {is_popular} = formData;

      const product = await db.models.products.findOne({
        where: {
          id: req.body.product_id
        }
      })

      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

      return product.update({is_popular})
        .then(async (product) => {

          const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

          return BaseResponse.Success(res, 'Product successfully updated', {data})
        })
        .catch(err => {
          return BaseResponse.BadResponse(res, err.message);
        });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async setTopProduct(req, res) {
    try {
      const validator = await ProductValidator.validateUpdateTopProduct(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
      const {is_top} = formData;

      const product = await db.models.products.findOne({
        where: {
          id: req.body.product_id
        }
      })

      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

      return product.update({is_top})
        .then(async (product) => {

          const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

          return BaseResponse.Success(res, 'Product successfully updated', {data})
        })
        .catch(err => {
          return BaseResponse.BadResponse(res, err.message);
        })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async setNewProduct(req, res) {
    try {
      const validator = await ProductValidator.validateUpdateNewProduct(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
      const {is_new} = formData;

      const product = await db.models.products.findOne({
        where: {
          id: req.body.product_id
        }
      })

      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

      return product.update({is_new})
        .then(async (product) => {

          const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

          return BaseResponse.Success(res, 'Product successfully updated', {data})
        })
        .catch(err => {
          return BaseResponse.BadResponse(res, err.message);
        })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async setRecommendProduct(req, res) {
    try {
      const validator = await ProductValidator.validateUpdateRecommnededProduct(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
      const {is_recommended} = formData;

      const product = await db.models.products.findOne({
        where: {
          id: req.body.product_id
        }
      })

      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

      return product.update({is_recommended})
        .then(async (product) => {

          const data = await ProductHelper.getFormattedProductData({where: {id: product.id}});

          return BaseResponse.Success(res, 'Product successfully updated', {data})
        })
        .catch(err => {
          return BaseResponse.BadResponse(res, err.message);
        })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async likeProduct(req, res) {
    // try{
    const product = await db.models.products.findOne({
      where: {
        id: parseInt(req.body.product_id)
      },
      include: [{
        model: db.models.merchants,
        as: 'merchants'
      }]
    })

    if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");

    let likes = 0;

    const product_likes = await db.models.product_likes.findOne({
      where: {
        product_id: product.id,
        user_id: req.user.id
      }
    })
    if (product_likes) {
      await db.models.product_likes.destroy({
        where: {
          product_id: req.body.product_id,
          user_id: req.user.id
        }
      });
      likes = product.likes - 1;
    } else {

      const prod_like = await db.models.product_likes.create({
        product_id: req.body.product_id,
        user_id: req.user.id
      });

      likes = product.likes + 1;
      await NotificationHandler.createNotificationMerchantProd(product, NotificationHandler.TYPE.PRODUCT_LIKE, req.user.id);
    }
    if (likes < 0) { likes = 0 }
    await db.models.products.update({likes: likes}, {where: {id: product.id}});


    const data = await ProductHelper.getFormattedProductData({where: {id: product.id}}, req.user.id);

    const prodlikemsg = product_likes < data.likes ? 'like' : 'unlike';
    // const prodlikemsg = 'like';
    console.log("product: ", prodlikemsg);
    console.log("->", req.body.product_id, req.user.id);

    return BaseResponse.Success(res, 'You ' + prodlikemsg + ' this Product', {data})
    // }catch(err){
    //   return BaseResponse.BadResponse(res, err.message);
    // }

  }

  async getProductFeaturedList(req, res) {

    return await db.models.products.findAll({
        where: {
          category_id: req.query.category_id,
          is_featured: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_LIVE]}
        }
      })
      .then(async (product) => {
        const clause = {
          where: {
            category_id: req.query.category_id,
            is_featured: 1,
            status: {[Op.in]: [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_LIVE]}
          }
        }

        let user_id = 0
        if (req.user) user_id = req.user.id;
        else if (req.query.user_id) user_id = parseInt(req.query.user_id);

        if (product) return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Featured Products", user_id);
        return BaseResponse.BadResponse(res, 'No Featured Products yet!');
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async getProductRecommendedList(req, res) {
    try {
      const {category_id} = req.query;
      if (!category_id) {
        return BaseResponse.BadResponse(res, 'Mising params');
      }

      const clause = {
        where: {
          category_id,
          is_recommended: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED]}
        }
      }

      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);

      return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Recommended Products", user_id);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getProductHotList(req, res) {
    try {
      const {category_id} = req.query;
      if (!category_id) {
        return BaseResponse.BadResponse(res, 'Mising params');
      }

      const clause = {
        where: {
          category_id,
          is_hot: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED]}
        }
      }

      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);

      return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Hot Products", user_id);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getProductTopList(req, res) {
    try {
      const {category_id} = req.query;
      if (!category_id) {
        return BaseResponse.BadResponse(res, 'Mising params');
      }

      const clause = {
        where: {
          category_id,
          is_top: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED]}
        }
      }

      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);

      return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Top Products", user_id);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getProductNewList(req, res) {
    try {
      const {category_id} = req.query;
      if (!category_id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const clause = {
        where: {
          category_id,
          is_new: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED]}
        }
      }

      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);

      return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of New Products", user_id);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getProductPopularList(req, res) {
    try {
      const {category_id} = req.query;
      if (!category_id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const clause = {
        where: {
          category_id,
          is_popular: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED]}
        }
      }

      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);

      return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Hot Products", user_id);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getProductLikesList(req, res) {
    return await db.models.product_likes.findAll({
        attributes: ['product_id'],
        where: {
          user_id: parseInt(req.user.id),
          // status: { [Op.in]: [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_LIVE] }
        }
      })
      .then(async (product) => {
        const prod_id = product ? product.map(elem => {
          return elem.product_id;
        }) : [];
        const user_id = parseInt(req.user.id);
        let clause = {};
        clause.where = {};
        clause.where.id = {[Op.in]: prod_id};
        // clause.where.status = { [Op.in]: [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_LIVE] };

        if (product) return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Liked Products", user_id);

        return await BaseResponse.BadResponse(res, 'No Liked Products yet!');
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }

  async getProductLikesListByUserId(req, res) {
    return await db.models.product_likes.findAll({
        attributes: ['product_id'],
        where: {
          user_id: parseInt(req.query.user_id),
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_LIVE]}
        }
      })
      .then(async (product) => {
        const prod_id = product ? product.map(elem => {
          return elem.product_id;
        }) : [];
        const user_id = parseInt(req.query.user_id);
        let clause = {};
        clause.where = {};
        clause.where.id = {[Op.in]: prod_id};
        // clause.where.status = { [Op.in]: [PRODUCT.STATUS_APPROVED, PRODUCT.STATUS_LIVE] };

        if (product) return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Liked Products", user_id);

        return await BaseResponse.BadResponse(res, 'No Liked Products yet!');
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }


  async getAllMerchantProducts(req, res) {
    if (!req.query.merchant_id) return BaseResponse.BadResponse(res, "Merchant Id is required");
    let clause = {
      where: {
        merchant_id: req.query.merchant_id
      }
    };

    const { keyword } = req.query;
    if (keyword) {
      clause.where[Op.or] = [
        {
          name: { [Op.like]: `%${keyword.trim()}%` },
        },
        {
          description: { [Op.like]: `%${keyword.trim()}%` },
        }
      ]
    }

    let user_id = 0
    if (req.user) user_id = req.user.id;
    else if (req.query.user_id) user_id = parseInt(req.query.user_id);
    return await Pagination.pagingProduct(req, res, db.models.products, clause, user_id);
  }

  async getAllMerchantProductsByCategory(req, res) {
    const {user} = req;
    let user_id = null;
    if (user) {
      user_id = user.id;
    }
    if (!req.query.category_id) return BaseResponse.BadResponse(res, "Category Id is required");
    if (!req.query.merchant_id) return BaseResponse.BadResponse(res, "Merchant Id is required");
    let clause = {
      where: {
        merchant_id: req.query.merchant_id,
        category_id: req.query.category_id,
        status: 2
      }
    };
    if (req.query.keyword) {
      clause.where.name = {
        [Op.like]: `%${req.query.keyword}%`
      }
    }
    console.log(clause)
    if (req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0) {
      return await Pagination.pagingProduct(req, res, db.models.products, clause, 'List of Products', user_id);
    } else {
      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);
      const data = await ProductHelper.getFormattedProductsByMerCat(req.query.merchant_id, req.query.category_id);
      let msg = "Successfully Retrieved List(s)";
      if (data && data.length == 0) msg = "No Data";
      return BaseResponse.Success(res, msg, {
        data
      });
    }
  }

  async getReviewsOfProductById(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const product = await ProductsService.findOne({
        where: {
          id,
        }
      });

      if (!product) {
        return BaseResponse.BadRequest(res, 'Product not found.');
      }

      const whereClause = {
        where: {
          product_id: id
        }
      };

      const includes = [
        {
          model: db.models.review_assets,
          as: 'assets',
        },
        {
          as: 'product_review_replies',
          model: db.models.product_review_replies,
          include: [{
            as: 'user',
            model: db.models.users,
            attributes: ['id', 'name', 'avatar_url']
          }]
        },
        {
          as: 'user',
          model: db.models.users,
          attributes: ['id', 'name', 'avatar_url']
        },
        {
          as: 'order',
          model: db.models.orders,
          attributes: ['id', 'code'],
          include: [{
            as: 'order_items',
            model: db.models.order_items,
            where: {
              product_id: id,
            }
          }]
        }
      ]

      return await Pagination.paging(req, res, db.models.product_reviews, whereClause, includes);

    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  // Get recommmended products based on category settings
  async getRecommendedProducts(req, res) {
    try {
      const setting = await SettingsService.findOne({
        where: {
          type: 1,
        }
      });
      let categoryIds = [];
      if (!setting) {
        categoryIds = await db.models.product_categories.findAll({
          where: {
            status: 1,
          },
          raw: true,
          attributes: ['id'],
        });
        categoryIds = categoryIds.map(item => item.id);
      } else {
        categoryIds = setting.values;
      }

      const clause = {
        where: {
          category_id: {
            [Op.in]: categoryIds,
          },
          is_top: 1,
          status: {[Op.in]: [PRODUCT.STATUS_APPROVED]}
        }
      }

      let user_id = 0
      if (req.user) user_id = req.user.id;
      else if (req.query.user_id) user_id = parseInt(req.query.user_id);

      return await Pagination.pagingProduct(req, res, db.models.products, clause, "List of Recommended Products", user_id);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async checkProductInFlashDeal(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const now = moment();

      const eventItem = await EventItemsService.findOne({
        where: {
          item_id: id,
          status: EVENT_ITEM_STATUS.ACTIVE,
          '$event.type$': EVENT_TYPES.FLASH_DEAL,
          '$event.status$': EVENT_STATUS.ACTIVE,
          '$event.start_date$': {
            [Op.lte]: now.toDate(),
          },
          '$event.end_date$': {
            [Op.gte]: now.toDate(),
          }
        },
        include: [
          {
            model: db.models.events,
            as: 'event'
          },
        ]
      });

      return BaseResponse.Success(res, 'Check product in flash deal', { data: eventItem ?? null });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async uploadVideo(req, res, next) {
    try {
      const { id } = req.params;
      const product = await db.models.products.findOne({
        where: {
          id,
        }
      });
      if (!product) return BaseResponse.UnprocessableEntity(res, "Product not found");
      const validator = await ProductValidator.validateUploadVideo(req);

      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const { success, error, uploadedFile } = await ProductHelper.uploadVideo(req, product);

      if (!success) {
        return BaseResponse.BadResponse(res, error.message);
      }

      const uploadedVideo = uploadedFile[0] || '';
      if (!uploadedVideo) {
        return BaseResponse.BadResponse(res, 'Something went wrong. Please try again later');
      }
      const videoUrl = uploadedVideo.publicUrl();
      const oldVideoUrl = product.video_url;
      product.video_url = videoUrl;
      await product.save();

      // Remove old video
      if (oldVideoUrl) {
        const filenamefrmpath = oldVideoUrl.split("/product/videos/");
        const prevDestFile = filenamefrmpath[1];
        ProductHelper.removeVideo(prevDestFile);
      }

      return BaseResponse.Success(res, 'Upload video success', { data: product });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new ProductHandler;
