const db = require('../configs/sequelize');
const Sequelize = require('sequelize');

const Pagination = class  {
    async paging(req, res, model, clause = {where: {}}, include = null, success_message = "Successfully Retrieved List(s)") {
        let totalRec = 0, pageCount = 0;
        let start       = 0;
        let currentPage = 1;

        const {where, attributes, ...options} = clause;
        
        try {
          let pageSize  = req.query.pageSize ? parseInt(req.query.pageSize) : 5;
          let tempClause = {
            where,
            ...options,
            // include
          };
          delete tempClause.order;
          totalRec = await model.count(tempClause);
          
          options.attributes = attributes;

          pageCount =  Math.ceil(totalRec /  pageSize);
          
          if (typeof req.query.page !== 'undefined') {
            currentPage = req.query.page;
          }
        
          if(currentPage >1){
            start = (currentPage - 1) * pageSize;
          }
          
          if(include) clause.include = include;

          if(!clause.order) clause.order = [['id','DESC']];

          return await model.findAll({...clause, limit: pageSize, offset: start})
            .then(async(records) => {
              let msg = success_message;
              // Seems like total Records is number. But the old code use .count of totalRec.
              // Also there is nobody raise this issue from FE.
              const totalRecords = !isNaN(+totalRec) ? totalRec : (totalRec.count || 0)
              if(totalRecords === 0) msg = "No Data";
              return await BaseResponse.Success(res, msg, { data: records, pageSize: records.length, pageCount: parseInt(pageCount), currentPage: parseInt(currentPage), totalRec: totalRecords });
            })
            .catch(err => {
              return BaseResponse.BadResponse(res, err.message);
            });

        } catch (err) {

          return BaseResponse.BadResponse(res, err.message)
  
        }
    }

    async pagingProduct(req, res, model, clause, success_message = "Successfully Retrieved List(s)",user_id = 0) {
      let totalRec = 0, pageCount = 0;
      let start       = 0;
      let currentPage = 1;

      try {
        let pageSize  = req.query.pageSize ? parseInt(req.query.pageSize) : 5;
        
        totalRec = await model.findAndCountAll(clause);

        pageCount =  Math.ceil(totalRec.count /  pageSize);
        
        if (typeof req.query.page !== 'undefined') {
          currentPage = req.query.page;
        }
      
        if(currentPage >1){
          start = (currentPage - 1) * pageSize;
        }
        
        const exclude = ['brand','category','delivery','product_reviews'];
        
        clause.attributes = {
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
                SELECT products.sell_price - ((prod_categories.fee/100) * products.sell_price)
                FROM product_categories AS prod_categories
                WHERE prod_categories.id = products.category_id
              )`),
              'settle_price'
            ]
          ]
        };
        
        console.log("user_id prod paging",user_id);
        clause.include = [
          {
            model: db.models.product_reviews,
            as: `product_reviews`,
            attributes: {
              include: [
                [db.literal(`(
                      SELECT ROUND(AVG(reviews.score),1)
                      FROM product_reviews AS reviews
                      WHERE reviews.product_id = products.id
                  )`),
                'avg_rating']
              ]
            }
          },{
            model: db.models.product_assets,
            as: 'product_assets',
            attributes: ['id','url','description','is_image','status']
          },
          // {
          //   model: db.models.product_reviews,
          //   as: 'product_reviews',
          //   include: [{
          //     model: db.models.users,
          //     as: 'user',
          //     attributes: ['id','name','email','avatar_url','contact_no','status']
          //   },{
          //     model: db.models.orders,
          //     as: 'order',
          //     include: ['order_items']
          //   }]
          // },
          {
            model: db.models.product_brands,
            as: 'brand',
            attributes: ['id','name','description','status']
          },
          {
            model: db.models.product_categories,
            as: 'category',
            attributes: ['id','name','description','status']
          },
          {
            model: db.models.product_deliveries,
            as: 'delivery',
            attributes: ['id','name','description','fee','status']
          },
          {
            model: db.models.merchants,
            as: 'merchants',
            attributes: ['id','name','code','office_phone_number','office_address','acra_number','acra_business_profile','status', 'type'],
            include: [{
              model: db.models.users,
              as: 'user',
              attributes: ['id','name','email','avatar_url','contact_no','status']
            }]
          },
        ];


        // [Sequelize.literal(`(products.sell_price * product_categories.fee)`), 'totalAmount'],
        
        clause.order = [['id','DESC']];
        // clause.exclude = ['likes'];

        return await model.findAll({...clause, limit: pageSize, offset: start})
          .then(async(info) => {
            let records = info;
            // if(records && exclude){
            //   records = records.map((result) => {
            //         const rec = result.toJSON();
            //         for(let key of exclude){
            //           delete rec[key];
            //         }
            //         // if(rec.merchants.user) delete rec.merchants.user;
            //         return rec;
            //   });
            // }
            let msg = success_message;
            if(records && records.length == 0) msg = "No Data";
            
            return await BaseResponse.Success(res, msg, { data: records, pageSize: records.length, pageCount: parseInt(pageCount), currentPage: parseInt(currentPage), totalRec: totalRec.count });
          })
          .catch(err => {
            return BaseResponse.BadResponse(res, err.message);
          });

      } catch (err) {

        return BaseResponse.BadResponse(res, err.message)

      }
  }

  async pagingMerchantProduct(req, res, model, clause, success_message = "Successfully Retrieved List(s)") {
    let totalRec    = 0, pageCount = 0;
    let start       = 0;
    let currentPage = 1;

    try {
      let pageSize  = req.query.pageSize ? parseInt(req.query.pageSize) : 5;
      
      totalRec = await model.findAndCountAll(clause);

      pageCount =  Math.ceil(totalRec.count /  pageSize);
      
      if (typeof req.query.page !== 'undefined') {
        currentPage = req.query.page;
      }
    
      if(currentPage >1){
        start = (currentPage - 1) * pageSize;
      }
      
      const exclude = null;// ['brand','category'];
     
      clause.include = [
                        {
                          model: db.models.product_categories,
                          as: 'category',
                          include: [
                            {
                              model: db.models.products,
                              as: 'products',
                              include: [{
                                        model: db.models.product_assets,
                                        as: 'product_assets'
                                      },
                                      {
                                        model: db.models.product_brands,
                                        as: 'brand',
                                      }
                                    ]
                            }
                          ]
                        }
                    ];

      clause.order = [['id','DESC']];

      return await model.findAll({...clause, limit: pageSize, offset: start})
        .then(async(info) => {
          let records = info;
          if(records && typeof records !== 'undefined' && exclude){
            records = records.map((result) => {
                  const rec = result.toJSON();

                  rec.products.map((prod_rec,i) => {
                    for(let key of exclude){
                      delete rec.products[i][key];
                    }
                  })
                  
                  return rec;
            });
          }
          if(totalRec.count == 0) success_message = "No Data";
          return await BaseResponse.Success(res, success_message, { data: records, pageSize: records.length, pageCount: parseInt(pageCount), currentPage: parseInt(currentPage), totalRec: totalRec.count });
        })
        .catch(err => {
          return BaseResponse.BadResponse(res, err.message);
        });

    } catch (err) {

      return BaseResponse.BadResponse(res, err.message)

    }
  }

  // async pagingOrderItems(req, res, model, clause, include = null, success_message = "Successfully Retrieved List(s)", exclude = []) {
  //   let totalRec = 0, pageCount = 0;
  //   let start       = 0;
  //   let currentPage = 1;

  //   try {
  //     let pageSize  = req.query.pageSize ? parseInt(req.query.pageSize) : 5;
  
  //     totalRec = await model.findAndCountAll(clause);

  //     pageCount =  Math.ceil(totalRec.count /  pageSize);
  
  //     if (typeof req.query.page !== 'undefined') {
  //       currentPage = req.query.page;
  //     }
  
  //     if(currentPage >1){
  //       start = (currentPage - 1) * pageSize;
  //     }
  
  //     if(include) clause.include = include;

  //     clause.order = [['id','DESC']];

  //     return await model.findAll({...clause, limit: pageSize, offset: start})
  //       .then(async(info) => {

  //         let records = info.map((result) => {
  //               const rec = result.toJSON();
  //               return rec.order_items;
  //         });

  //         if(totalRec.count == 0) success_message = "No Data";
  //         return await BaseResponse.Success(res, success_message, { data: records, pageSize: records.length, pageCount: parseInt(pageCount), currentPage: parseInt(currentPage), totalRec: totalRec.count });
  //       })
  //       .catch(err => {
  //         return BaseResponse.BadResponse(res, err.message);
  //       });

  //     } catch (err) {

  //       return BaseResponse.BadResponse(res, err.message)

  //     }
  // }

  
  async simple(req, res, model, options = {}) {
    let pageSize  = req.query.pageSize ? parseInt(req.query.pageSize) : 5;
    let page = req.query.page ? parseInt(req.query.pageSize) : 1;
    model.findAndCountAll({
      where: options.where ?? {},
      include: options.include ?? {},
      limit: pageSize,
      offset: (page - 1) * pageSize
    })
      .then(result => {
        res.send({
          result
        })
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message)
      })
  }
}

module.exports = new Pagination;
