const ProductBrandValidator = require('../../validators/product-brand');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination')

const PRODUCT_BRAND = { STATUS_INACTIVE: 0, STATUS_ACTIVE : 1 }; // Added be frank

class ProductBrandHandler {
  async addProductBrand(req, res) {
    const validator = ProductBrandValidator.validateAddProductBrand(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const productBrand = await db.models.product_brands.create({
      name: formData.name,
      description: formData.description,
      status: PRODUCT_BRAND.STATUS_ACTIVE
    });

    return BaseResponse.Success(res, 'Product Brand added successfully', {
      data: productBrand
    });
  }

  async getAllProductBrand(req, res) {
    let clause = {};
    clause.where = {};
    if(req.query.keyword) clause.where.name = { [Op.like]: "%"+req.query.keyword+"%" };
    if(req.query.status && !isNaN(req.query.status)) clause.where.status = parseInt(req.query.status);
    
    if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
      return Pagination.paging(req,res,db.models.product_brands,clause);
    }else{
      const productBrands = await db.models.product_brands.findAll(clause);
      let msg = 'Product Brands';
      if(productBrands && productBrands.length == 0) msg = "No Data";
      return BaseResponse.Success(res, msg, {
        data: productBrands
      });
    }
    
  }

  async getProductBrand(req, res) {
    const productBrandId = req.query.product_brand_id;

    const productBrand = await db.models.product_brands.findOne({
      where: {
        id: productBrandId
      },
      include: [{
        model: db.models.products,
        as: 'products'
      }]
    });

    if (productBrand) {
      return BaseResponse.Success(res, 'Product Brand Found', {
        data: productBrand
      })
    } else {
      return BaseResponse.BadResponse(res, 'Product Brand not found');
    }
  }

  async updateProductBrand(req, res) {
    const validator = ProductBrandValidator.validateUpdateProductBrand(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const productBrandId = req.query.product_brand_id;

    db.models.product_brands.update({
      name: formData.name,
      description: formData.description
    }, {
      where: {
        id: productBrandId
      }
    }).then(async (result) => {
      const productBrand = await db.models.product_brands.findOne({
        where: {
          id: productBrandId
        }
      });

      return BaseResponse.Success(res, 'Product Brand updated', {
        data: productBrand
      })
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }

  async deleteProductBrand(req, res) {

    return await db.models.product_brands.destroy({ where: { id: req.body.product_brand_id } })
                    .then(product => {
                      if(product) return BaseResponse.Success(res, 'Product Brand successfully deleted', { data: product });
                      return BaseResponse.BadResponse(res, 'Product Brand Not Found!');
                    })
                    .catch(err => {
                      return BaseResponse.BadResponse(res, err.message);
                    })
  }

  async softDeleteProductBrand(req, res) {
    const productBrandId = req.body.product_brand_id;
    db.models.product_brands.update({
        status: PRODUCT_BRAND.STATUS_INACTIVE
      },{
      where: {
        id: productBrandId
      }
    }).then(result => {
      return BaseResponse.Success(res, 'Product Brand deleted')
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }
}

module.exports = new ProductBrandHandler;