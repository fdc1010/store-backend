const UUID = require('uuid');
const fs = require('fs');
const { Op } = require('sequelize');

const MerchantValidator = require('../../validators/merchant');
const db = require('../../configs/sequelize');
const gcs = require('../../configs/gcs');
const { MERCHANT_STATUS, PRODUCT_STATUS, SEARCH_MERCHANT_FIELDS, SEARCH_MERCHANT_TYPES } = require('../../configs');
const BcryptHelper = require('../../utils/bcrypt');
const StrHelper = require('../../utils/str');
const JwtHelper = require('../../utils/jwt');
const Pagination = require('../../utils/pagination');
const FCMHelper = require('../../utils/fcm-helper');

const StorageService = require('../../services/storage.service');
const ProductService = require('../../services/products.service');
const MerchantService = require('../../services/merchant.service');
const ScheduleCallService = require('../../services/schedule-call.service');
class MerchantHandler {
  async register(req, res) {
    const validator = await MerchantValidator.validateRegisterMerchant(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const transaction = await db.transaction();

    try {
      const isAdmin = req.user ? req.user.is_superadmin : false;

      const role = await db.models.roles
        .findOne({
          where: {
            name: 'merchant'
          }
        });

      const user = await db.models.users
        .create({
          role_id: role.id,
          name: formData.contact_name,
          email: formData.email,
          password: BcryptHelper.hash(isAdmin ? '123456' : formData.password),
          contact_no: `${formData.handphone_code} ${formData.handphone_number}`,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURI(formData.contact_name)}&color=7F9CF5&background=EBF4FF`,
          status: 1,
          is_store_user: 0
        }, {transaction: transaction});

      const file = formData.files.business_profile;
      const destinationPath = `acra/${StrHelper.slug(formData.name)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`
      const uploadedFile = await gcs.bucket(process.env.GCS_BUCKET_NAME)
        .upload(file.tempFilePath, {
          destination: destinationPath
        });
      const businessProfile = uploadedFile[0];

      fs.unlink(file.tempFilePath, () => {
      });

      const merchantCount = await db.models.merchants.count();

      const merchant = await db.models.merchants
        .create({
          user_id: user.id,
          code: `M-${StrHelper.padNumber(merchantCount + 1, 6)}`,
          name: formData.name,
          office_phone_number: `${formData.office_phone_code} ${formData.office_phone_number}`,
          office_address: formData.office_address,
          acra_number: formData.acra_number,
          acra_business_profile: businessProfile.publicUrl(),
          status: isAdmin ? 1 : 0,
          type: formData.type ?? 1,
          facebook: formData.facebook || '',
          website: formData.website || '',
          instagram: formData.instagram || '',
          latitude: formData.latitude,
          longitude: formData.longitude,
          postal_code: formData.postal_code,
          industry: formData.industry,
        }, {transaction: transaction});

      await transaction.commit();

      const jwtToken = await JwtHelper.generateJwt({
        id: user.id,
        name: user.name,
        email: user.email
      });

      // Added by Frank. Adding fcm token to user
      const fcm_token = req.body.fcm_token ? req.body.fcm_token : null;
      const fcm_topics = req.body.fcm_topics ? req.body.fcm_topics : null;
      await FCMHelper.addUserFcm(user.id,fcm_token,fcm_topics);
      // ========================================

      return BaseResponse.Success(res, 'Merchant Register Successfully, please wait for our verification', {
        user: user,
        merchant: merchant,
        accessToken: jwtToken.value
      })
    } catch (err) {
      await transaction.rollback();
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async merchantVerification(req, res) {
    const validator = MerchantValidator.validateMerchantVerification(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;

    const merchantId = req.params.merchant_id;
    db.models.merchants.update({
      status: formData.status,
    }, {
      where: {
        id: merchantId,
        status: 0
      }
    }).then((result) => {
      if (result[0] === 0) throw new Error('Merchant verification failed');
      const message = formData.status === 1 ? 'Merchant Successfully Accepted' : 'Merchant Successfully Declined';
      return BaseResponse.Success(res, message);
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    });
  }

  async editMerchant(req, res) {
    try {
      if(!req.query.merchant_id) return BaseResponse.UnprocessableEntity(res, "Merchant Id is required");
      const merchant = await db.models.merchants.findOne({ where: { id: req.query.merchant_id } });

      if(!merchant && !req.user.is_superadmin && (req.user.merchants[0] && req.query.merchant_id != req.user.merchants[0].id) ) return BaseResponse.BadResponse(res, "Record don't exist! or You have no access to edit merchant details");
      req.user_id = merchant.user_id;

      const validator = await MerchantValidator.validateEditMerchant(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;

      // Handle upload new businessprofile
      let businessProfile = null;
      if(formData.files){

        const filenamefrmpath = merchant.acra_business_profile.split("/acra/");
        const prevDestFile = `acra/${filenamefrmpath[1]}`;
        gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).exists().then(async data => {
          if(data[0]) await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).delete();
        });

        const file = formData.files.business_profile;
        const destinationPath = `acra/${StrHelper.slug(formData.name)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`
        const uploadedFile = await gcs.bucket(process.env.GCS_BUCKET_NAME)
          .upload(file.tempFilePath, {
            destination: destinationPath
          });
        businessProfile = uploadedFile[0];

        fs.unlink(file.tempFilePath, () => {
        });
      }
      // End upload new business profile

      let user_data = {};
      let data = {
        name: formData.name,
        office_phone_number: `${formData.office_phone_code} ${formData.office_phone_number}`,
        office_address: formData.office_address,
        acra_number: formData.acra_number,
        opening_hours: formData.opening_hours,
        about: formData.about,
        type: formData.type ?? 1,
        facebook: formData.facebook,
        website: formData.website,
        instagram: formData.instagram,
        latitude: formData.latitude,
        longitude: formData.longitude,
        postal_code: formData.postal_code,
        industry: formData.industry
      };

      if(businessProfile) data.acra_business_profile = businessProfile.publicUrl();
      if(formData.email) user_data.email = formData.email;
      if (formData.handphone_code && formData.handphone_number) {
        user_data.contact_no = `${formData.handphone_code} ${formData.handphone_number}`;
      }

      db.models.users.update(user_data, { where: { id: merchant.user_id } } );

      const result = await merchant.update(data, {
        where: {
          id: req.query.merchant_id
        }
      });
      // .then(async (result) => {

      //   return BaseResponse.Success(res, 'Merchant successfully updated!', {
      //     data: result
      //   })
      // }).catch(err => {
      //   return BaseResponse.BadResponse(res, err.message);
      // })
      return BaseResponse.Success(res, 'Merchant successfully updated!', {
        data: result
      })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getAllMerchant(req, res) {
    const defaultStatus = [1,2];
    const status = req.query.status || -1;
    const search = req.query.keyword;
    const industry = req.query.industry;
    const clauses = parseInt(status) !== -1 ? { status } : { status: { [Op.in]: defaultStatus } };
    if (industry && parseInt(industry) !== -1) {
      clauses.industry = industry;
    }

    if (search) {
      // clauses.name = {
      //   [Op.like]: `%${search}%`
      // }
      clauses[Op.or] = [
        {
          name: { [Op.like]: `%${search}%` },
        },
        {
          acra_number: { [Op.like]: `%${search}%` },
        },
        {
          website: { [Op.like]: `%${search}%` },
        },
        {
          office_phone_number: { [Op.like]: `%${search}%` },
        },
        {
          office_address: { [Op.like]: `%${search}%` },
        },
        {
          postal_code: { [Op.like]: `%${search}%` },
        },
        {
          '$user.email$': { [Op.like]: `%${search}%` },
        }
      ]
    }

    const includeUser = {
      model: db.models.users,
      as: 'user',
      attributes: {
        exclude: ['password']
      }
    };

    let clause = {
      where: clauses, include: [includeUser]
    };

    return await Pagination.paging(req, res, db.models.merchants, clause);

    // const merchants = await db.models.merchants
    //   .findAll({
    //     where: clauses,
    //     include: [{
    //       model: db.models.users,
    //       as: 'user',
    //       attributes: {
    //         exclude: ['password']
    //       }
    //     }]
    //   });

    // return BaseResponse.Success(res, 'Merchant Successfully retrieved', {
    //   merchants
    // });
  }

  async getMerchantViewById(req, res) {


    const merchants = await db.models.merchants
      .findAll({
        where: {
          id: req.query.merchant_id
        },
        include: [{
          model: db.models.users,
          as: 'user',
          attributes: {
            exclude: ['password']
          }
        }]
      });

    return BaseResponse.Success(res, 'Merchant Successfully retrieved', {
      data: merchants
    });
  }

  async getMerchantView(req, res) {

    let clause = {
                    where: {
                      id: req.user.merchants[0].id
                    }
                  };

    return await Pagination.pagingMerchantProduct(req, res, db.models.merchants, clause);
  }

  async searchMerchant(req, res, next) {
    try {
      const {keyword = ''} = req.query;
      let where = {};
      if (keyword) {
        where[Op.or] = [
          {
            name: { [Op.like]: `%${search}%` },
          },
          {
            acra_number: { [Op.like]: `%${search}%` },
          },
          {
            website: { [Op.like]: `%${search}%` },
          },
          {
            office_phone_number: { [Op.like]: `%${search}%` },
          },
          {
            office_address: { [Op.like]: `%${search}%` },
          },
          {
            postal_code: { [Op.like]: `%${search}%` },
          },
        ]
      }

      const results = await MerchantService.getMerchants({
        where,
      });

      return BaseResponse.Success(res, 'Merchant Successfully retrieved', {data: results})
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async getMerchantReviews(req, res) {
    // Get all reviews
    const includes = [
      {
        as: 'product',
        model: db.models.products,
        attributes: ['id', 'name', 'code', 'merchant_id'],
        include: [
          {
            model: db.models.product_assets,
            as: 'product_assets',
            separate: true,
            order: ['id', 'ASC'],
          }
        ]
      },
      {
      as: 'user',
      model: db.models.users,
      attributes: ['id', 'name', 'avatar_url']
      },
        {
      as: 'product_review_replies',
      model: db.models.product_review_replies,
      include: [{
        as: 'user',
        model: db.models.users,
        attributes: ['id', 'name', 'avatar_url']
      }]
      }
    ];
    
    // Getting review_ids
    const review_ids = await db.models.product_reviews.findAll({
      attributes: ['id'],
      where: {
        '$product.merchant_id$': req.params.merchant_id
      },
      include: {
        as: 'product',
        model: db.models.products,
        attributes: ['id', 'name', 'code', 'merchant_id'],
        include: ['product_assets']
      }
    }).then(res => res.map(review => review.id))
    
    const clause = {
      where: {
        'id': {
          [Op.in]: review_ids
        }
      },
      order: [['created_at', 'desc']]
    }

    includes.push({
      as: 'order',
      model: db.models.orders,
      attributes: ['id', 'code'],
      include: [{
        as: 'order_items',
        model: db.models.order_items,
        where: {
          product_id: {[Op.col]: 'product_reviews.product_id'},
        }
      }]
    });

    includes.push({
      model: db.models.review_assets,
      as: 'assets'
    });
    
    return Pagination.paging(req, res, db.models.product_reviews, clause, includes)
  }
  
  async replyProductReview(req, res){
    const validator = await MerchantValidator.validateReplyReview(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });
    
    const product_review = await db.models.product_reviews.findOne({
      where: {
        id: req.params.product_review_id
      },
      include: ['product']
    });
    
    if (req.user.is_merchant) {
      if (product_review.product.merchant_id !== req.user.merchants[0].id) {
        return BaseResponse.Forbidden(res)
      }
    }
    
    db.models.product_review_replies.create({
      product_review_id: product_review.id,
      user_id: req.user.id,
      comment: validator.data.comment
    })
      .then(result => {
        return BaseResponse.Success(res, "Comment successfully replied")
      })
      .catch(err => {
        console.error(err)
        return BaseResponse.BadResponse(res, err.message)
      })
  }

  async getMerchant(req, res, next) {
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest('Missing params');
      }

      const merchant = await MerchantService.findOne({
        where: {
          id,
        },
        include: [
          {
            model: db.models.users,
            as: 'user',
            attributes: ['id','name','email','avatar_url','contact_no','status']
          }
        ]
      });

      if (!merchant) {
        return BaseResponse.BadResponse(res, 'Not found!');
      }

      // Getting opening status of this merchant
      const { open_status, next_time } = MerchantService.getOpeningStatus(merchant);

      const merchantData = {...merchant.publicJSON(), open_status, next_time };

      return BaseResponse.Success(res, 'Merchant', {data: merchantData});
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  getColorSettings(req, res, next) {
    try {
      const data = [
        '8D2A2A',
        'AA7103',
        '4A3872',
        '384C72',
        '236D10',
        '106D6D',
      ];
      return BaseResponse.Success(res, 'Get color success', { data });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async editSettings(req, res, next) {
    try {
      const {user} = req;
      const merchant = user.merchants[0];

      const validator = await MerchantValidator.validateEditSetting(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
      let bannerImage = null;
      if(formData.files){
        // Remove previous banner image
        if (merchant.banner_image) {
          const filenamefrmpath = merchant.banner_image.split("/banner/");
          const prevDestFile = `banner/${filenamefrmpath[1]}`;
          StorageService.removeFile(prevDestFile);
        }

        // Upload new banner
        const file = formData.files.banner_image;
        const destinationPath = `banner/${StrHelper.slug(merchant.name)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`;
        bannerImage = await StorageService.uploadFile({ file, destinationPath });
      }

      const data = {
        color_settings: formData.color_settings,
      }
      if(bannerImage) data.banner_image = bannerImage.publicUrl();

      const result = await merchant.update({...data});

      return BaseResponse.Success(res, 'Update merchant successfully.', { data:  result.publicJSON() })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getMerchantScheduleCalls(req, res, next) {
    try {
      const id = req.params.id;
      const results = await ScheduleCallService.findAll({
        where: {
          merchant_id: id,
        }
      });

      return BaseResponse.Success(res, 'Get schedule calls successfuly', { data: results });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getMyScheduleCalls(req, res, next) {
    try {
      const { user } = req;
      const { status } = req.query;
      const merchant = (user.merchants || [])[0] || null;
      if (!merchant) {
        return BaseResponse.BadRequest(res, 'Not found');
      }
      const clause = {
        where: {
          merchant_id: merchant.id,
        }
      }

      if (status) {
        clause.where.status = status;
      }

      const includes = [
        {
          as: 'user',
          model: db.models.users,
          attributes: ['name', 'email', 'contact_no', 'gender']
        },
      ]

      return Pagination.paging(req, res, db.models.schedule_calls, clause, includes);
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async disableMerchant(req, res, next) {
    let transaction = null;
    try {
      const { id } = req.params;

      const merchant = await MerchantService.findOne({
        where: {
          id,
          status: MERCHANT_STATUS.ACTIVE,
        }
      });

      if (!merchant) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      transaction = await db.transaction();
      merchant.status = MERCHANT_STATUS.DISABLED;
      await merchant.save({ transaction });

      await ProductService.update({
        data: {
          status: PRODUCT_STATUS.INACTIVE,
        },
        where: {
          merchant_id: merchant.id,
          status: PRODUCT_STATUS.APPROVED,
        },
        transaction,
      });

      await transaction.commit();

      return BaseResponse.Success(res, 'Disable merchant successfully.', { data: null });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async activeMerchant(req, res, next) {
    let transaction = null;
    try {
      const { id } = req.params;

      const merchant = await MerchantService.findOne({
        where: {
          id,
          status: MERCHANT_STATUS.DISABLED,
        }
      });

      if (!merchant) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      transaction = await db.transaction();
      merchant.status = MERCHANT_STATUS.ACTIVE;
      await merchant.save({ transaction });

      await ProductService.update({
        data: {
          status: PRODUCT_STATUS.APPROVED,
        },
        where: {
          merchant_id: merchant.id,
          status: PRODUCT_STATUS.INACTIVE,
        },
        transaction,
      });

      await transaction.commit();

      return BaseResponse.Success(res, 'Reactive merchant successfully.', { data: null });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async filterMerchant(req, res, next) {
    try {
      const { keyword, type = SEARCH_MERCHANT_TYPES.NAME, status = -1, industry } = req.query;

      const defaultStatus = [1,2];
      const fieldName = SEARCH_MERCHANT_FIELDS[type];

      const clauses = parseInt(status) !== -1 ? { status } : { status: { [Op.in]: defaultStatus } };
      if (industry && parseInt(industry) !== -1) {
        clauses.industry = industry;
      }

      if (keyword) {
        clauses[fieldName] = {
          [Op.like]: `%${keyword}%`
        }
      }

      const includeUser = {
        model: db.models.users,
        as: 'user',
        attributes: {
          exclude: ['password']
        }
      };

      let clause = {
        where: clauses, include: [includeUser]
      };

      return await Pagination.paging(req, res, db.models.merchants, clause);

    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new MerchantHandler;
