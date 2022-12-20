const db = require('../configs/sequelize');
const UUID = require('uuid');
const fs = require('fs');
const StrHelper = require('./str');
const gcs = require('../configs/gcs');
const Merchantservice = require('../services/merchant.service');

class ProductHelper {
  
  async saveProductAssets(req, res) {
    
    if (!req.files) {
      return;
    }
    
    try {
      
      let vals = req.files ? Object.values(req.files) : null;
      if (vals && typeof vals[0].length !== "undefined" && vals[0].length >= 1) {
        console.log('save product first condition');
        for (let f of vals[0]) {
          let file = f;
          const file_name = `${StrHelper.slug(req.product.code)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`;
          const destinationPath = `product/${file_name}`
          const uploadedFile = await gcs.bucket(process.env.GCS_BUCKET_NAME)
            .upload(file.tempFilePath, {
              destination: destinationPath
            });
          const product_asset_file = uploadedFile[0];
          
          const file_mimetype = file.mimetype.split("/");
          
          await db.models.product_assets.create({
            product_id: req.product.id,
            url: product_asset_file.publicUrl(),
            is_image: 1,
            filename: file_name,
            file_size: file.size,
            file_extension: file_mimetype[1]
          });
          fs.unlink(file.tempFilePath, () => {
          });
        }
      } else if (vals && vals.length >= 1) {
        console.log('save product 2nd condition');
        let file = vals[0];
        const file_name = `${StrHelper.slug(req.product.name)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`;
        const destinationPath = `product/${file_name}`
        const uploadedFile = await gcs.bucket(process.env.GCS_BUCKET_NAME)
          .upload(file.tempFilePath, {
            destination: destinationPath
          });
        const product_asset_file = uploadedFile[0];
        
        const file_mimetype = file.mimetype.split("/");
        
        await db.models.product_assets.create({
          product_id: req.product.id,
          url: product_asset_file.publicUrl(),
          is_image: 1,
          filename: file_name,
          file_size: file.size,
          file_extension: file_mimetype[1]
        });
        fs.unlink(file.tempFilePath, () => {
        });
      }
    } catch (err) {
      console.log('save product assets error: ', err);
      return err;
    }
    
    return;
    
  };
  
  async formatProductData(product) {
    let data = product;
    if (product) {
      data = product.toJSON();
      if (data.brand) delete data.brand;
      if (data.category) delete data.category;
      if (data.merchants) delete data.merchants;
    }
    
    return data;
  }
  
  async getFormattedProductData(clause, user_id = 0) {
    let product = await db.models.products.findOne({
      ...clause,
      attributes: {
        include: [
          [
            db.literal(`(
                SELECT IF(COUNT(*) > 0, 1, 0)
                FROM product_likes AS prod_likes
                WHERE prod_likes.user_id = ${user_id}
                AND prod_likes.product_id = products.id
            )`),
            'my_likes'
          ],
          [
            db.literal(`(
              SELECT ROUND(AVG(reviews.score),1)
              FROM product_reviews AS reviews
              WHERE reviews.product_id = products.id
            )`),
            'average_rating'
          ],
        ]
      },
      include: [
        {
          model: db.models.product_assets,
          as: 'product_assets',
          attributes: ['id', 'url', 'description', 'is_image', 'status']
        },
        {
          model: db.models.product_brands,
          as: 'brand',
          attributes: ['id', 'name', 'description', 'status']
        },
        {
          model: db.models.product_categories,
          as: 'category',
          attributes: ['id', 'name', 'description', 'status']
        },
        {
          model: db.models.product_deliveries,
          as: 'delivery',
          attributes: ['id', 'name', 'description', 'fee', 'status']
        },
        {
          model: db.models.merchants,
          as: 'merchants',
          // attributes: ['id', 'name', 'code', 'office_phone_number', 'office_address', 'acra_number', 'acra_business_profile', 'status'],
          include: [{
            model: db.models.users,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar_url', 'contact_no', 'status']
          }]
        },
        {
          model: db.models.products_crowdfund,
          as: 'products_crowdfund',
        },
        {
          model: db.models.products_insurance,
          as: 'products_insurance',
        },
      ]
    });
    let data = product;
    if (product) {
      data = product.toJSON();
      data.avg_rating = data.average_rating;
      delete data.average_rating;
      // if(data.product_likes) delete data.product_likes;
      // if(data.category) delete data.category;
      // if(data.delivery) delete data.delivery;
      // if(data.merchants) delete data.merchants.user;

      if (data.merchants) {
        const { open_status, next_time } = Merchantservice.getOpeningStatus(data.merchants);
        data.merchants = { ...data.merchants, open_status, next_time };
      }
    }
    
    return data;
  }
  
  async getFormattedProductsByMerCat(merchant_id, category_id, user_id = 0) {
    
    let merchant = await db.models.merchants.findOne({
      attributes: ['name', 'code', 'office_phone_number', 'office_address', 'acra_number', 'acra_business_profile', 'status'],
      where: {
        id: merchant_id
      }
    });
    let category = await db.models.product_categories.findOne({
      attributes: ['name', 'description', 'fee', 'status'],
      where: {
        id: category_id
      }
    });
    let results = await db.models.products.findAll({
      where: {
        merchant_id: merchant_id,
        category_id: category_id
      },
      // attributes: {
      //   include: [
      //     [
      //       db.literal(`(
      //             SELECT IF(COUNT(*) > 0, 1, 0)
      //             FROM product_likes AS prod_likes
      //             WHERE prod_likes.product_id = products.id
      //             AND prod_likes.user_id = ${user_id}
      //         )`),
      //       'my_likes'
      //     ]
      //   ]
      // },
      include: [
        {
          model: db.models.product_assets,
          as: 'product_assets'
        },
        {
          model: db.models.product_brands,
          as: 'brand',
          attributes: ['name']
        },
        {
          model: db.models.product_likes,
          as: 'product_likes',
          attributes: ['product_id']
        },
        // {
        //   model: db.models.product_categories,
        //   as: 'category',
        //   attributes: ['name']
        // },
        // {
        //   model: db.models.merchants,
        //   as: 'merchants',
        //   attributes: ['name','code','office_phone_number','office_address','acra_number','acra_business_profile','status']
        // }
      ]
    });
    let products = results;
    if (products && typeof products !== 'undefined') {
      products = products.map((result) => {
        const rec = result.toJSON();
        delete rec.brand;
        return rec;
      });
    }
    
    return {merchant, category, products};
  }

  async uploadVideo(req, product) {
    try {
      let vals = req.files ? Object.values(req.files) : null;
      if (!vals || !vals.length || !vals[0]) {
        return { success: false, error: new Error('Missing file') };
      }

      let file = vals[0];
      const file_name = `${product.id}-${StrHelper.slug(product.name)}-${UUID.v4()}${StrHelper.getFileExtension(file.name)}`;
      const destinationPath = `product/videos/${file_name}`
      const uploadedFile = await gcs.bucket(process.env.GCS_BUCKET_NAME)
        .upload(file.tempFilePath, {
          destination: destinationPath
        });

      fs.unlink(file.tempFilePath, () => {});
      return { success: true, error: null, uploadedFile };
    } catch (err) {
      console.log('upload video err: ', err);
      return { success: false, error: err };
    }
  }

  async removeVideo(path) {
    try {
      const removeFilePath = `product/videos/${path}`;
      gcs.bucket(process.env.GCS_BUCKET_NAME).file(removeFilePath).exists().then(async data => {
        if(data[0]) {
          gcs.bucket(process.env.GCS_BUCKET_NAME).file(removeFilePath).delete();
        } 
      });
    } catch (err) {
      console.log('remove video err: ', err);
    }
  }

  checkVariantQuantity({ product = {}, cartItem = {} }) {
    const { variant } = product;
    const cartItemVariant = cartItem.variant;
    if (!variant || !cartItemVariant) {
      return { success: false, error: 'Not enough products' };
    }

    const { value } = variant[0] || { value: [] };
    const productVariant = value.find(({ name }) => name === cartItemVariant);
    if (!productVariant) {
      return { success: false, error: `Not enough products ${product.name} ${cartItemVariant}` };
    }

    const productVariantQuantity = productVariant.quantity;
    const { quantity } = cartItem;
    if (productVariantQuantity < quantity) {
      return { success: false,  error: `Not enough products ${product.name} ${cartItemVariant}` };
    }

    return { success: true, error: null, productVariantQuantity }
  }
}

module.exports = new ProductHelper;
