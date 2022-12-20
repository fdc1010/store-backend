const ProductCategoryValidator = require('../../validators/product-category');
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const PRODUCT_CATEGORIES = {STATUS_INACTIVE: 0, STATUS_ACTIVE: 1}; // Added be frank

class ProductCategoryHandler {
  async addProductCategory(req, res) {
    const validator = await ProductCategoryValidator.validateAddProductCategory(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });
    
    const formData = validator.data;
    const productCategory = await db.models.product_categories.create({
      merchant_id: req.user.is_merchant ? req.user.merchants[0].id : 0,
      name: formData.name,
      description: formData.description,
      fee: formData.fee,
      status: PRODUCT_CATEGORIES.STATUS_ACTIVE
    });
    
    return BaseResponse.Success(res, 'Product Category added successfully', {
      data: productCategory
    });
  }
  
  async getAllProductCategory(req, res) {
    let clause = {
      order: ['position']
    };
    clause.where = {};
    if (req.query.keyword) clause.where.name = {[Op.like]: "%" + req.query.keyword + "%"};
    if (req.query.status && !isNaN(req.query.status)) clause.where.status = parseInt(req.query.status);
    
    if (req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0) {
      return Pagination.paging(req, res, db.models.product_categories, clause);
    } else {
      const productCategories = await db.models.product_categories.findAll(clause);
      return BaseResponse.Success(res, 'Product Category', {
        data: productCategories
      });
      
    }
    
  }
  
  async getFilterProductCategoryList(req, res) {
    let clause = {};
    clause.where = {};
    if (req.body.keyword) clause.where.name = {[Op.like]: "%" + req.body.keyword + "%"};
    if (req.body.status && !isNaN(req.body.status)) clause.where.status = parseInt(req.body.status);
    
    if (req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0) {
      return Pagination.paging(req, res, db.models.product_categories, clause);
    } else {
      const productCategories = await db.models.product_categories.findAll(clause);
      return BaseResponse.Success(res, 'Product Category', {
        data: productCategories
      });
      
    }
    
  }
  
  async getAllProductCategoryByMerchant(req, res) {
    const includes = [{
      model: db.models.merchant_categories,
      as: 'merchant_categories',
      where: {
        merchant_id: req.query.merchant_id
      }
    }];
    let clause = {};
    clause.where = {};
    clause.where.status = 2;
    if (!req.query.merchant_id || isNaN(req.query.merchant_id)) return BaseResponse.BadResponse(res, 'Merchant Id required to be numeric');
    
    if (req.query.keyword) clause.where.name = {[Op.like]: "%" + req.query.keyword + "%"};
    if (req.query.status && !isNaN(req.query.status)) clause.where.status = parseInt(req.query.status);
    
    clause.where.merchant_id = parseInt(req.query.merchant_id);
    clause.attributes = ['category_id'];
    
    const products = await db.models.products.findAll(clause);
    const cat_ids = products ? products.map(elem => {
      return elem.category_id;
    }) : [];
    
    let clauseCat = {};
    clauseCat.where = {};
    clauseCat.where.id = {[Op.in]: cat_ids};
    clauseCat.order = [['merchant_categories', 'position', 'asc']]
    
    if (req.query.cat_keyword) clauseCat.where.name = {[Op.like]: "%" + req.query.cat_keyword + "%"};
    if (req.query.cat_status && !isNaN(req.query.cat_status)) clauseCat.where.status = parseInt(req.query.cat_status);
    
    if (req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0) {
      return Pagination.paging(req, res, db.models.product_categories, clauseCat, includes);
    } else {
      const productCategories = await db.models.product_categories.findAll({
        ...clauseCat,
        include: includes
      });
      let msg = 'Product Category';
      if (productCategories && productCategories.length == 0) msg = "No Data";
      return BaseResponse.Success(res, msg, {
        data: productCategories
      });
      
    }
    
  }
  
  async getProductCategory(req, res) {
    const productCategoryId = req.query.product_category_id;
    const productCategory = await db.models.product_categories.findOne({
      where: {
        id: productCategoryId
      },
      include: [{
        model: db.models.products,
        as: 'products'
      }]
    });
    
    if (productCategory) {
      return BaseResponse.Success(res, 'Product Category found', {
        data: productCategory
      })
    } else {
      return BaseResponse.BadResponse(res, 'Product Category not found');
    }
  }
  
  async updateProductCategory(req, res) {
    try {
      if (!req.query.product_category_id) {
        return BaseResponse.BadResponse(res, 'Missing category id');
      }
      
      const validator = await ProductCategoryValidator.validateUpdateProductCategory(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });
      
      const formData = validator.data;
      const productCategoryId = req.query.product_category_id;
      db.models.product_categories.update({
        name: formData.name,
        description: formData.description,
        fee: formData.fee
      }, {
        where: {
          id: productCategoryId
        }
      }).then(async (result) => {
        const productCategory = await db.models.product_categories.findOne({
          where: {
            id: productCategoryId
          }
        });
        
        return BaseResponse.Success(res, 'Product Category updated', {
          data: productCategory
        })
      }).catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async deleteProductCategory(req, res) {
    
    return await db.models.product_categories.destroy({where: {id: req.body.product_category_id}})
      .then(product => {
        if (product) return BaseResponse.Success(res, 'Product Category successfully deleted', {data: product});
        return BaseResponse.BadResponse(res, 'Product Category Not Found!');
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
  }
  
  async softDeleteProductCategory(req, res) {
    const productCategoryId = req.body.product_category_id;
    db.models.product_categories.update({
      status: PRODUCT_CATEGORIES.STATUS_INACTIVE
    }, {
      where: {
        id: productCategoryId
      }
    }).then(result => {
      return BaseResponse.Success(res, 'Product Category deleted')
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }
  
  async getCategoryPosition(req, res) {
    const self = new ProductCategoryHandler;
    if (req.user.is_superadmin) {
      if(req.query.pageSize){
        return await self.getAllProductCategory(req, res);
      } else {
        const categories = await db.models.product_categories
          .findAll({
            where: {
              status: 1
            },
            order: ['position']
          });
  
        return BaseResponse.Success(res, 'Success get admin category', {
          categories
        });
      }
    } else {
      if(req.query.pageSize){
        req.query.merchant_id = req.user.merchants[0].id;
        return await self.getAllProductCategoryByMerchant(req, res);
      } else {
        const merchantCategories = await db.models.merchant_categories
          .findAll({
            where: {
              merchant_id: req.user.merchants[0].id
            },
            order: ['position'],
            include: 'category'
          });
  
        const categories = merchantCategories.map(merchantCategory => {
          merchantCategory = merchantCategory.toJSON()
          const category = merchantCategory.category;
          category.category_id = category.id;
          category.id = merchantCategory.id;
          category.position = merchantCategory.position;
          return category;
        });
  
        return BaseResponse.Success(res, 'Success get merchant category', {
          categories
        })
      }
    }
  }
  
  async updateCategoryPosition(req, res) {
    const categoriesData = req.body;
    const transaction = await db.transaction();
    try {
      if (req.user.is_superadmin) {
        for (const categoryData of categoriesData) {
          await db.models.product_categories.update({
            position: categoryData.position,
          }, {
            where: {
              id: categoryData.category_id
            },
            transaction: transaction
          })
        }
      } else {
        for (const categoryData of categoriesData) {
          await db.models.merchant_categories.update({
            position: categoryData.position,
          }, {
            where: {
              category_id: categoryData.category_id,
              merchant_id: req.user.merchants[0].id
            },
            transaction: transaction
          })
        }
      }
      
      await transaction.commit()
      return BaseResponse.Success(res, 'Update Category Success')
    } catch (err) {
      await transaction.rollback()
      console.error(err)
      return BaseResponse.BadResponse(res, 'Something error')
    }
  }
  
  async resolveProductCategory(req, res) {
    // Resolve Product Category
    const categories = await db.models.product_categories
      .findAll({
        where: {
          status: 1
        }
      });
    
    let pos = 1;
    for (const category of categories) {
      category.position = pos++;
      await category.save();
    }
    
    // Resolve Merchant Product Category
    const productCategories = (await db.models.product_categories
      .findAll({
        attributes: ['id'],
        raw: true
      })).map(category => category.id);
    
    const merchants = (await db.models.merchants
      .findAll({
        attributes: ['id'],
        raw: true
      })).map(merchant => merchant.id);
    
    const merchantCategories = (await db.models.products
      .findAll({
        attributes: ['merchant_id', 'category_id'],
        group: ['category_id', 'merchant_id'],
        where: {
          merchant_id: {[Op.not]: null}
        },
        order: ['merchant_id'],
        raw: true
      })).filter(merchantCategory => productCategories.includes(merchantCategory.category_id) && merchants.includes(merchantCategory.merchant_id));
    
    let inc = 1, mId = null;
    for (const merchantCategory of merchantCategories) {
      if (merchantCategory.merchant_id !== mId) {
        inc = 1;
        mId = merchantCategory.merchant_id;
      }
      
      merchantCategory.position = inc++;
      db.models.merchant_categories.create(merchantCategory)
        .catch(err => {
          console.log("Duplicated")
        })
    }
    
    return BaseResponse.Success(res, '', {
      merchantCategories
    })
    
    // db.models.merchant_categories.bulkCreate(merchantCategories)
    //   .then(() => {
    //     return BaseResponse.Success(res, '', {
    //       merchantCategories
    //     })
    //   })
    //   .catch(err => {
    //     console.log(err)
    //     return BaseResponse.InternalServerError(res, err);
    //   })
  }

  async changeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status = 1 } = req.body;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const category = await db.models.product_categories.findOne({
        where: { id }
      });

      if (!category) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      category.status = status;
      await category.save();

      return BaseResponse.Success(res, 'Change status successed.', { data: category });

    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new ProductCategoryHandler;
