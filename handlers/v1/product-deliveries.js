const ProductDeliveriesValidator = require('../../validators/product-deliveries');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const Pagination = require('../../utils/pagination')

const PRODUCT_DELIVERIES = { STATUS_INACTIVE: 0, STATUS_ACTIVE : 1 }; // Added be frank

class ProductDeliveriesHandler {
  async addProductDeliveries(req, res) {
    const validator = ProductDeliveriesValidator.validateAddProductDeliveries(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const productDeliveries = await db.models.product_deliveries.create({
      name: formData.name,
      description: formData.description,
      fee: formData.fee,
      status: PRODUCT_DELIVERIES.STATUS_ACTIVE
    });

    return BaseResponse.Success(res, 'Product Deliveries added successfully', {
      data: productDeliveries
    });
  }

  async getAllProductDeliveries(req, res) {
    let clause = {};
    clause.where = {};
    if(req.query.keyword) clause.where.name = { [Op.like]: "%"+req.query.keyword+"%" };
    if(req.query.status && !isNaN(req.query.status)) clause.where.status = parseInt(req.query.status);
    
    if(req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0){
      return Pagination.paging(req,res,db.models.product_deliveries,clause);
    }else{
      const productDeliveries = await db.models.product_deliveries.findAll(clause);
      let msg = 'Product Deliveries';
      if(productDeliveries && productDeliveries.length == 0) msg = "No Data";
      return BaseResponse.Success(res, msg, {
        data: productDeliveries
      });
      
    }
  }

  async getProductDeliveries(req, res) {
    const productDeliveriesId = req.query.product_deliveries_id;

    const productDeliveries = await db.models.product_deliveries.findOne({
      where: {
        id: productDeliveriesId
      },
      include: [{
        model: db.models.products,
        as: 'products'
      }]
    });

    if (productDeliveries) {
      return BaseResponse.Success(res, 'Product Deliveries Found', {
        data: productDeliveries
      })
    } else {
      return BaseResponse.BadResponse(res, 'Product Deliveries not found');
    }
  }

  async updateProductDeliveries(req, res) {
    const validator = ProductDeliveriesValidator.validateUpdateProductDeliveries(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });

    const formData = validator.data;
    const productDeliveriesId = req.query.product_deliveries_id;

    db.models.product_deliveries.update({
      name: formData.name,
      description: formData.description,
      fee: formData.fee
    }, {
      where: {
        id: productDeliveriesId
      }
    }).then(async (result) => {
      const productDeliveries = await db.models.product_deliveries.findOne({
        where: {
          id: productDeliveriesId
        }
      });

      return BaseResponse.Success(res, 'Product Deliveries updated', {
        data: productDeliveries
      })
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }

  async deleteProductDeliveries(req, res) {

    return await db.models.product_deliveries.destroy({ where: { id: req.body.product_deliveries_id } })
                    .then(product => {
                      if(product) return BaseResponse.Success(res, 'Product Deliveries successfully deleted', {  });
                      return BaseResponse.BadResponse(res, 'Product Deliveries Not Found!');
                    })
                    .catch(err => {
                      return BaseResponse.BadResponse(res, err.message);
                    })
  }

  async softDeleteProductDeliveries(req, res) {
    const productDeliveriesId = req.body.product_deliveries_id;
    // db.models.product_deliveries.destroy({
    //   where: {
    //     id: productDeliveriesId
    //   }
    // }).then(result => {
    //   return BaseResponse.Success(res, 'Product Deliveries deleted')
    // }).catch(err => {
    //   return BaseResponse.BadResponse(res, err.message);
    // })

    db.models.product_deliveries.update({
      status: PRODUCT_DELIVERIES.STATUS_INACTIVE
      },{
      where: {
        id: productDeliveriesId
      }
    }).then(result => {
      return BaseResponse.Success(res, 'Product Deliveries deleted')
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }
}

module.exports = new ProductDeliveriesHandler;