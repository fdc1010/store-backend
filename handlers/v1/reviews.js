"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const UUID = require('uuid');

const db = require('../../configs/sequelize');
const StrHelper = require('../../utils/str');
const Pagination = require("../../utils/pagination");
const ProductReviewValidator = require('../../validators/reviews');
const ReviewAssetsService = require('../../services/review_assets.service');
const { REVIEW_STORAGE_FOLDER, ASSET_FILE_TYPES } = require('../../configs');


class ProductReviewHandler {
    async getProductReviews(req, res) {
        const productId = req.query.product_id;

        const productReviews = await db.models.product_reviews.findAll({
            where: {
                product_id: productId
            },
            include: [{
                model: db.models.users,
                as: 'user',
                attributes: ['id', 'name']
            }, {
              model: db.models.review_assets,
              as: 'assets',
          }]
        });

        if (productReviews) {
            return BaseResponse.Success(res, 'Product Reviews Found', {
                product_reviews: productReviews
            })
        }else {
            return BaseResponse.BadResponse(res, 'Product Review not found');
        }
    }

    async addProductReview(req, res) {
      let transaction = null;
      try {
        const validator = ProductReviewValidator.validateAddReviews(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        const user = req.user;
        const product = await db.models.products.findOne({ where: { id: formData.product_id }});
        const order = await db.models.orders.findOne({ where : { id: formData.order_id }});

        if (!product){
          return BaseResponse.BadResponse(res, 'Product not found.');
        }
        if (!order){
          return BaseResponse.BadResponse(res, 'Order not found.');
        }

        const existedReview = await db.models.product_reviews.findOne({
          where: {
            user_id: user.id,
            product_id: product.id,
            order_id: order.id,
            order_item_id: formData.order_item_id,
          }
        });

        if (existedReview) {
          return BaseResponse.BadResponse(res, 'You have already sent your review about this item');
        }

        transaction = await db.transaction();

        const createdReview = await db.models.product_reviews.create({
          user_id: user.id,
          ...formData,
        }, {
          transaction,
        });

        await ReviewAssetsService.createAssets(req.files, product, order, transaction, createdReview);
        await transaction.commit();

        return BaseResponse.Success(res, 'success');
      } catch (err) {
        console.log('err: ', err);
        if (transaction) {
          await transaction.rollback();
        }
        return BaseResponse.BadResponse(res, err.message);
      }
    }
    async getProductReviewsListByOrderId(req, res) {
        let clause = {};
        clause.where = {};

        if(req.query.product_id) clause.where.product_id = parseInt(req.query.product_id);
        if(req.query.order_id) clause.where.order_id = parseInt(req.query.order_id);
        if(req.query.user_id) clause.where.user_id = parseInt(req.query.user_id);
        else if(req.user) clause.where.user_id = parseInt(req.user.id);

        const include = [{
                            model: db.models.users,
                            as: 'user',
                            attributes: ['id', 'name']
                        },{
                            model: db.models.products,
                            as: 'product',
                            include: ['product_assets']
                        },{
                          model: db.models.review_assets,
                          as: 'assets',
                      }];

        if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
          return Pagination.paging(req,res,db.models.product_reviews,clause,include);
        }else{
          clause.include = include;
          const productReviews = await db.models.product_reviews.findAll(clause);
          return BaseResponse.Success(res, 'Product Reviews', {
            data: productReviews
          });
        }
        
      }
    async getReviewsListByOrderId(req, res) {
        let clause = {};
        clause.where = {};

        if(req.query.product_id) clause.where.product_id = parseInt(req.query.product_id);
        if(req.query.order_id) clause.where.order_id = parseInt(req.query.order_id);
        if(req.query.user_id || req.user.id){
            const userId = req.user ? req.user.id : parseInt(req.query.user_id);
            const orders = await db.models.orders.findAll({
                attributes: ['id'],
                where: {
                    user_id: userId
                }
            });

            const ord_id = orders ? orders.map(elem =>{ return elem.id; }) : [];

            clause.where.order_id = { [Op.in]: ord_id };
        }

        clause.attributes = {
            include: [
              [
                db.literal(`(
                      SELECT ROUND(AVG(reviews.score),1)
                      FROM product_reviews AS reviews
                      WHERE reviews.product_id = order_items.product_id
                  )`),
                'avg_rating'
              ]
            ]
          };
        const include = [{
                            model: db.models.products,
                            as: 'product',
                            attributes: ['id','name','description','product_details','variant',
                            [
                                db.literal(`(
                                    SELECT pa.url
                                    FROM product_assets AS pa
                                    WHERE pa.product_id = order_items.product_id
                                    ORDER BY pa.id LIMIT 1
                                )`),
                                'product_asset'
                            ]]
                        }];

        if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
          return Pagination.paging(req,res,db.models.order_items,clause,include);
        }else{
          clause.include = include;
          const productReviews = await db.models.order_items.findAll(clause);
          return BaseResponse.Success(res, 'Reviews', {
            data: productReviews
          });
        }
        
      }


  async listReviewOrderItems(req, res) {
    let clause = {};
    clause.where = {};
    let userId = 0;
    // const clause = req.user ? (req.user.role_id === 1 ? {} : {where: {user_id: req.user.id}}) : {where: {session_id: req.query.session_id}};
    if(req.query.order_id) clause.where.id = parseInt(req.query.order_id);
    if(req.query.user_id) clause.where.user_id = userId = parseInt(req.query.user_id);
    else if(req.user) clause.where.user_id = userId = parseInt(req.user.id);
    else if(req.query.session_id) clause.where.session_id = userId = parseInt(req.user.req.query.session_id);

    const formData = {
      type: (req.query.type ? req.query.type : ''),
      status: !isNaN(req.query.status) ? [parseInt(req.query.status)] : [0, 1, 2, 3]
    };

    if (formData.type) {
      formData.status = formData.type === 'past' ? [4,5] : [0, 1, 2, 3];
    }

    if (formData.status) {
      // clause.where = clause.where ?? {}
      clause.where.status = {
        [Op.in]: formData.status
      }
    }

    clause.attributes = ['id'];
    
    const ordersArr = await db.models.orders.findAll(clause);
    const orderIds = ordersArr ? ordersArr.map(elem =>{ return elem.id; }) : [];
    let clause_ordItm = {};
    clause_ordItm.where = {};
    if(ordersArr) clause_ordItm.where.order_id = { [Op.in]: orderIds };
    
    clause_ordItm.attributes = ['id','sub_total','status_name','order_id','product_id','variant','quantity',
                                    'item_price','shipping_price','status',
                                    [db.literal(`(
                                            SELECT r.score
                                            FROM product_reviews AS r
                                            WHERE r.product_id = order_items.product_id
                                            AND r.order_id = order_items.order_id
                                            AND r.user_id = ${userId}
                                            AND r.order_item_id = order_items.id
                                        )`),
                                    'score'],
                                    // [db.literal(`(
                                    //         SELECT r.id
                                    //         FROM product_reviews AS r
                                    //         WHERE r.product_id = order_items.product_id
                                    //         AND r.order_id = order_items.order_id
                                    //         AND r.user_id = ${userId}
                                    //         AND r.order_item_id = order_items.id
                                    //     )`),
                                    // 'review_id']
                                  ];

    const include = [
      {
        model: db.models.products,
        as: 'product',
        include: [
          {
            model: db.models.product_assets,
            as: 'product_assets',
            separate: true,
            order: [
              ['id', 'ASC']
            ]
          },
        ]
      },
      {
        model: db.models.product_reviews,
        as: 'product_reviews',
        include: ['assets'],
      }
    ];

    return await Pagination.paging(req, res, db.models.order_items, clause_ordItm,include);
  }

  async removeAsset(req, res, next) {
    try {
      const user = req.user;
      const { id, assetId } = req.params;
      if (!id || !assetId) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const review = await db.models.product_reviews.findOne({
        where: {
          id,
          user_id: user.id,
        }
      });

      if (!review) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const reviewAsset = await ReviewAssetsService.findOne({
        where: {
          id: assetId
        }
      });

      if (!reviewAsset) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const { file_url } = reviewAsset;
      const removedFile = await ReviewAssetsService.removeAsset(file_url);
      const removedAsset = await ReviewAssetsService.destroy({
        where: {
          id: assetId,
        }
      });
      return BaseResponse.Success(res, 'Remove success', { data: { removedAsset } });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async editReview(req, res, next) {
    let transaction = null;
    try {
      const user = req.user;
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const review = await db.models.product_reviews.findOne({
        where: {
          id
        }
      });

      if (!review) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const validator = ProductReviewValidator.validateEditReviews(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;

      transaction = await db.transaction();
      review.comment = formData.comment;
      review.score = formData.score;
      await review.save({ transaction });

      // Create assets
      const product = await db.models.products.findOne({ where: { id: review.product_id } });
      const order = await db.models.orders.findOne({ where: { id: review.order_id } });

      await ReviewAssetsService.createAssets(req.files, product, order, transaction, review)
      await transaction.commit();

      return BaseResponse.Success(res, 'Edit success.', { data: review });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getReviewDetails(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const review = await db.models.product_reviews.findOne({
        where: {
          id,
        },
        include: ['assets']
      });

      if (!review) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      return BaseResponse.Success(res, 'Retreive review succesfully', { data: review });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new ProductReviewHandler;
