"use strict";
const UUID = require('uuid');
const fs = require('fs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const StrHelper = require('../../utils/str');
const gcs = require('../../configs/gcs');
const Pagination = require('../../utils/pagination')

const saveProductAssets = async (req, res) => { // async (req, res, product_asset_id, product_id, name, assets) => {
  // console.log("(req.files && req.files.product_assets)",(req.files && req.files.product_assets));
  // if (!(req.files && req.files.product_assets)) return {};

  try {
    const prod_asset_id = req.query.product_asset_id ? parseInt(req.query.product_asset_id) : 0;
    return await db.models.product_assets.findOne({
      where: {
        id: prod_asset_id
      }
    })
    .then(async(prod_asset) => {
      const file = req.files.product_assets;
      const file_name = `${StrHelper.slug(req.product.code)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`;
      const destinationPath = `product/${file_name}`
      const uploadedFile = await gcs.bucket(process.env.GCS_BUCKET_NAME)
        .upload(file.tempFilePath, {
          destination: destinationPath
        });
      const product_asset_file = uploadedFile[0];
      fs.unlink(file.tempFilePath, () => {});
      const file_mimetype = file.mimetype.split("/");

      if (!prod_asset){

        return await db.models.product_assets.create({
            product_id: req.product.id,
            url: product_asset_file.publicUrl(),
            is_image: 1,  
            filename: file_name,
            file_size: file.size,
            file_extension: file_mimetype[1]
        })
        .then(info => {
          return info;
        })
        .catch(err => {
          return err;
        }); 
        
      }else{

        const prevDestFile = `product/${prod_asset.filename}`;                      
        gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).exists().then(async data => {
          if(data[0]) await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).delete();
        });
        
        return await prod_asset.update({ 
          url: product_asset_file.publicUrl(),
          is_image: 1,  
          filename: file_name,
          file_size: file.size,
          file_extension: file_mimetype[1]
        })
        .then(info => {
          return info;
        })
        .catch(err => {
          return err;
        });
      }
    });
    
    
  }catch (err) {
      
    return err;
  }

  
};

class ProductAssetsHandler {
  async addProductAsset(req, res){
    if(!req.files || (req.files && !req.files.product_assets)) return BaseResponse.UnprocessableEntity(res, "Image file required!");
    const product = await db.models.products.findOne({
      where: {
        id: parseInt(req.body.product_id)
      }
    })
    .then(async(product)=>{  
      if (!product) return BaseResponse.BadResponse(res, "Product not found");
      if (product && (req.user.is_merchant && product.merchant_id != req.user.merchants[0].id) && !req.user.is_superadmin) return BaseResponse.UnprocessableEntity(res, "You're not allowed to update details if you don't own the product");
      req.product = product;
      return await saveProductAssets(req, res)
                                  .then(info => {
                                    return BaseResponse.Success(res, 'Product Asset successfully added', { data: info });
                                  })
                                  .catch(err => {
                                    return BaseResponse.BadResponse(res, err.message);
                                  })
    })
    .catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
                                
  }

  async updateProductAsset(req, res){
    if(!req.files || (req.files && !req.files.product_assets)) return BaseResponse.UnprocessableEntity(res, "Image file required!");
    const product = await db.models.products.findOne({
      where: {
        id: parseInt(req.body.product_id)
      }
    })
    .then(async(product)=>{    
      if (!product) return BaseResponse.BadResponse(res, "Product not found");
      if (product && (req.user.is_merchant && product.merchant_id != req.user.merchants[0].id) && !req.user.is_superadmin) return BaseResponse.UnprocessableEntity(res, "You're not allowed to update details if you don't own the product");
      req.product = product;
      return await saveProductAssets(req, res)
                              .then(info => {                              
                                return BaseResponse.Success(res, 'Product Asset successfully updated', { data: info });
                              })
                              .catch(err => {
                                return BaseResponse.BadResponse(res, err.message);
                              })

    })
    .catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }
  async deleteProductAsset(req, res){
    if(!req.body.product_id) return BaseResponse.BadResponse(res, "Product Id required!");
   
    return await db.models.products.findOne({
      where: {
        id: parseInt(req.body.product_id)
      }
    })
    .then(async(product)=>{      
      if (!product) return BaseResponse.BadResponse(res, "Product not found");
      if (product && (req.user.is_merchant && product.merchant_id != req.user.merchants[0].id) && !req.user.is_superadmin) return BaseResponse.UnprocessableEntity(res, "You're not allowed to update details if you don't own the product");
        
      return await db.models.product_assets.findAll({
        where: {
          product_id: parseInt(req.body.product_id)
        }
      })
      .then(async(product_asset)=>{
        console.log("product_asset.length",product_asset.length);
        if(product_asset.length == 1) return BaseResponse.BadResponse(res, "Product should have at least one (1) image");
        const prevDestFile = `product/${product_asset.filename}`;
        return await db.models.product_assets.destroy({ where: { id: parseInt(req.body.product_asset_id) } })
                      .then(async () => {
                        gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).exists().then(async data => {
                          if(data[0]) await gcs.bucket(process.env.GCS_BUCKET_NAME).file(prevDestFile).delete();
                        });
                        return BaseResponse.Success(res, 'Product Asset successfully deleted', { });
                      })
                      .catch(err => {
                        return BaseResponse.BadResponse(res, err.message);
                      })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      })
    })
    .catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })

    
    
    
  }
}

module.exports = new ProductAssetsHandler;
