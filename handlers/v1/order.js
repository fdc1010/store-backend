const {Op, or} = require('sequelize');
const excel = require('exceljs');
const moment = require('../../configs/moment')
const groupByFunc = require('lodash.groupby');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const db = require("../../configs/sequelize");
const StrHelper = require("../../utils/str");
const ArrayHelper = require('../../utils/array-helper');
const HitpayHelper = require("../../utils/lib/hitpay");
const Pagination = require("../../utils/pagination");
const OrderValidator = require("../../validators/order");
const Notification = require('./notification');
const UserAddress = require('./user-address');
const ShippingAddress = require('./shipping-details');
const FCMHelper = require('../../utils/fcm-helper');
const Trackingmore = require('../../utils/lib/trackingmore');

const { ORDER_STATUS, ORDER_TYPE, EVENT_TYPES, PRODUCT_TYPES, EVENT_ITEM_STATUS, EVENT_ITEM_TYPES } = require('../../configs');

const OrderService = require('../../services/orders.service');
const OrderItemService = require('../../services/order-item.service');
const CartService = require('../../services/cart.service');
const ProductService = require('../../services/products.service');

const { roundDecimal } = require('../../utils/number-helper');
const orders = require('../../models/orders');
const DeliveryService = require('../../services/delivery.service');
const EventsService = require('../../services/events.service');
const EventItemsService = require('../../services/event_items.service');
const productHelper = require('../../utils/product-helper');

class OrderHandler {
  async checkout(req, res) {
    if (!req.body.shipping_address) return BaseResponse.BadResponse(res, "Shipping Address is required!");

    const use_point = req.query.use_point == "true";
    
    const transaction = await db.transaction();
    try {
      let clause = req.user ? {user_id: req.user.id} : {session_id: req.query.session_id};
      let cart = await db.models.carts.findOne({
        where: clause,
        include: [
          {
            model: db.models.vouchers,
            as: "voucher",
          },
          {
            model: db.models.cart_items,
            as: "cart_items",
            include: [
              {
                model: db.models.products,
                as: "product",
                include: [
                  {
                    model: db.models.merchants,
                    as: "merchants",
                    attributes: ["id", "type"]
                  },
                  {
                    model: db.models.product_categories,
                    as: 'category',
                    attributes: ['id', 'fee'],
                  },
                ]
              },
              // {
              //   model: db.models.events,
              //   as: 'event',
              // }
            ],
          },
        ],
        transaction: transaction
      });

      // Check inactive product
      const checkItem = cart.toJSON().cart_items
        .find(item => item.product.status !== 2 && item.product.status !== 4);
      if (checkItem) throw new Error(`Product ${checkItem.product.name} cannot be purchased`)
  
      const currentFlashDeal = await EventsService.getActiveFlashDeal();
      let cartItems = cart.toJSON().cart_items;
      if (currentFlashDeal) {
        const eventItems = await EventItemsService.findAll({
          where: {
            event_id: currentFlashDeal.id,
            status: EVENT_ITEM_STATUS.ACTIVE,
            type: EVENT_ITEM_TYPES.PRODUCT_FLASH_DEAL,
          },
          attributes: ['id', 'item_id'],
        });
        const eventItemIds = eventItems.map(item => +item.item_id);
        // Map cart item with active event
        cartItems = cartItems.map(cartItem => {
          if (eventItemIds.includes(+cartItem.product_id)) {
            cartItem.event = currentFlashDeal;
          } else {
            cartItem.event = null;
          }
          return cartItem;
        });
      }
      const subCarts = groupByFunc(cartItems, "product.merchant_id")
  
      // Since we can hard remove order.
      // Then we will have an issue about order id is differrent with order NO.
      // Solution for now is: Get latest id. Then update new order code with latest id + 1
      // Will update when we have a better solutions.
  
      // const orderCount = await db.models.orders.count();
      const latestRecord = await db.models.orders.findOne({
        attributes: ['id'],
        order: [
          ['id', 'DESC'],
        ]
      });
      let latestId = latestRecord?.id ?? 0;
      let nextId = latestId + 1;
      const orderCode = ["ORD", ...Array(Object.keys(subCarts).length).fill().map(() => StrHelper.padNumber(nextId++, 6))].join("-")
      let couponApplied = false;
      let orderData = undefined;
      let totalOrder = 0;
      let rawTotal = 0;
      let rawTotalWithoutShippingFee = 0;
      const shippingFeeByMerchant = {};
      let totalDiscount = 0;
      
      for (const index in subCarts) {
        const totalQuantityBasedOnProduct = subCarts[index].reduce((result, item) => {
          const { quantity, id, product } = item;
          const productId = product.id;
          if (!result[productId]) {
            result[productId] = 0;
          }
    
          result[productId] += quantity;
    
          return result;
        }, {});

        const cartItems = subCarts[index].map((item) => {
          const result = { ...item};
          let cartItemPrice = item.item_price;
          let flashDealAmount = null;
          if ( item.product?.type === PRODUCT_TYPES.NORMAL) {
            const { price, flashDeal }= CartService.getNormalProductItemPrice(item, totalQuantityBasedOnProduct);
            cartItemPrice = price;
            flashDealAmount = flashDeal;
          } else {
            cartItemPrice = item.item_price;
          }
          result.item_sell_price = item.item_price;
          result.item_price = cartItemPrice;
          if (flashDealAmount) {
            const { event } = item;
            result.event = { event, flashDealAmount, originPrice: item.item_price }
          }
          return result;
        });
        const [ normalItems, foodItems ] = CartService.separateCartItemByFoodAndNormalShops(cartItems);
        for(const cartItem of normalItems) {
          // if (cartItem.quantity > cartItem.product.quantity) throw new Error(`Quantity for product ${cartItem.product.name} is not enough`);
          const { success, error } = productHelper.checkVariantQuantity( {product: cartItem.product, cartItem });
          if (!success) {
            throw new Error(error);
          }
          
          cartItem.subtotal = cartItem.quantity * cartItem.item_price;
          rawTotalWithoutShippingFee += cartItem.subtotal;
          // rawTotal += +cartItem.subtotal; // Shipping fee only calculated once for all merchant's products with the highest value.
        }
        let normalItemsShippingFee = 0;
        // rawTotalWithoutShippingFee = rawTotal;
        // if (normalItems && normalItems.length) {
        //   normalItemsShippingFee = CartService.getNormalItemShippingFeeByMerchantBasedOnDeliveryService(normalItems);
        //   rawTotal += normalItemsShippingFee;
        // }

        // Calculate total price for food merchant
        const itemsByMerchant = groupByFunc(foodItems, 'product.merchant_id');
        for ( const index in itemsByMerchant) {
          const foodCartItems = itemsByMerchant[index];
          const itemsPrice = foodCartItems.reduce((result, item) => result += item.quantity * item.item_price, 0);
          const shippingFee = foodCartItems[0].shipping_price;
          rawTotalWithoutShippingFee += itemsPrice;
          // rawTotal += itemsPrice + shippingFee;
        }
      }
      
      const subCartKeys = Object.keys(subCarts);
      const subCartKeyLength = subCartKeys.length;

      for (const index in subCarts) {
        const totalQuantityBasedOnProduct = subCarts[index].reduce((result, item) => {
          const data = { ...item };
          const { quantity, id, product } = item;
          const productId = product.id;
          if (!result[productId]) {
            result[productId] = 0;
          }
    
          result[productId] += quantity;
    
          return result;
        }, {});

        const cartItems = (subCarts[index] ?? []).map((item) => {
          const result = { ...item};
          let cartItemPrice = item.item_price;
          let flashDealAmount = null;
          if ( item.product?.type === PRODUCT_TYPES.NORMAL) {
            const { price, flashDeal } = CartService.getNormalProductItemPrice(item, totalQuantityBasedOnProduct);
            cartItemPrice = price;
            flashDealAmount = flashDeal;
          } else {
            cartItemPrice = item.item_price;
          }

          result.item_sell_price = item.item_price;
          result.item_price = cartItemPrice;
          if (flashDealAmount) {
            const { event } = item;
            result.event = { event, flashDealAmount, originPrice: item.item_price }
          }
          return result;
        });

        let subCartTotal = 0

        const [ normalItems, foodItems ] = CartService.separateCartItemByFoodAndNormalShops(cartItems);

        const subCart = {
          user_id: req.user.id,
          code: orderCode,
          status: 0,
          shipping_address: req.body.shipping_address,
        }
  
        let type = 1;
        for(const cartItem of normalItems) {
          // if (cartItem.quantity > cartItem.product.quantity) throw new Error(`Quantity for product ${cartItem.product.name} is not enough`);
          const { success, error, productVariantQuantity } = productHelper.checkVariantQuantity({ product: cartItem.product, cartItem });
          if (!success) {
            throw new Error(error);
          }
          cartItem.subtotal = cartItem.quantity * cartItem.item_price;
          subCartTotal += cartItem.subtotal; // Shipping fee only calculated once for all merchant's products with the highest value.
          if (cartItem.note) subCart.note = JSON.stringify({
            delivery_time: cartItem.note.delivery_time
          });
        }
        let normalItemsShippingFee = 0;
        if (normalItems && normalItems.length) {
          normalItemsShippingFee = CartService.getNormalItemShippingFeeByMerchantBasedOnDeliveryService(normalItems);
          // subCartTotal += normalItemsShippingFee;
        }

        // Calculate total price for food merchant
        const foodItemsByMerchant = Object.values(groupByFunc(foodItems, 'product.merchant_id'))[0] || [];
        if (foodItemsByMerchant && foodItemsByMerchant.length) {
          type = 2;
        }

        for ( const cartItem of foodItemsByMerchant) {
          cartItem.subtotal = cartItem.quantity * cartItem.item_price;
          subCartTotal += cartItem.subtotal;
          if (cartItem.note) subCart.note = JSON.stringify({
            delivery_time: cartItem.note.delivery_time
          });
        }
        const foodShippingFee = foodItemsByMerchant[0]?.shipping_price || 0;
        // subCartTotal += foodShippingFee;
        const totalShippingFee = normalItemsShippingFee + foodShippingFee;
        
        subCart.type = type;
        subCart.total = subCartTotal;
  
        if (cart.voucher) {

          const appliedVoucher = cart.voucher;
          const { start_date, end_date, used_count, quantity } = appliedVoucher;
          if (start_date && end_date) {
            const now = moment();
            if (now.isBefore(start_date) || now.isAfter(end_date) ) {
              return BaseResponse.BadResponse(res, 'Voucher is not available.');
            }

            // if (used_count >= quantity) {
            //   return BaseResponse.BadResponse(res, 'Voucher is not available.');
            // }
          }

          subCart.promo_code = cart.voucher.code;
          let discount = 0;
    
          if (cart.voucher.category_id) {
            const categoryTotal = cartItems
              .filter((item) => item.product.category_id === cart.voucher.category_id)
              .map((item) => item.quantity * item.item_price)
              .reduce((prev, curr) => prev + curr, 0);
            discount = cart.voucher.type === 0 ? (categoryTotal * cart.voucher.amount) / 100 : cart.voucher.amount;
          } else if (cart.voucher.brand_id) {
            const brandTotal = cartItems
              .filter((item) => item.product.brand_id === cart.voucher.brand_id)
              .map((item) => item.quantity * item.item_price)
              .reduce((prev, curr) => prev + curr, 0);
            discount = cart.voucher.type === 0 ? (brandTotal * cart.voucher.amount) / 100 : cart.voucher.amount;
          } else if (cart.voucher.product_id) {
            const productTotal = cartItems
              .filter((item) => item.product_id === cart.voucher.product_id)
              .map((item) => item.quantity * item.item_price)
              .reduce((prev, curr) => prev + curr, 0);
            discount = cart.voucher.type === 0 ? (productTotal * cart.voucher.amount) / 100 : cart.voucher.amount;
          } else {
            discount = cart.voucher.type === 0 ? (subCartTotal * cart.voucher.amount) / 100 : cart.voucher.amount;
          }
          // Check if discount amount is bigger than total without ship
          if (rawTotalWithoutShippingFee - discount < 0) {
            discount = rawTotalWithoutShippingFee;
          }
          subCart.voucher_id = cart.voucher_id;
          
          if(cart.voucher.type === 0) {
            subCart.voucher_discount = discount;
            totalDiscount += discount;
          } else {
            // Order 1 / total order * discount
            // subCart.voucher_discount = subCartTotal / rawTotal * discount
            subCart.voucher_discount = subCartTotal / rawTotalWithoutShippingFee * discount
            totalDiscount = discount;
          }
          
          if (discount > 0) {
            subCart.total = Math.max(subCartTotal - subCart.voucher_discount, 0)
            
            // Subs user voucher
            if(!couponApplied){
              const userVoucher = await db.models.user_vouchers.findOne({
                where: {
                  user_id: req.user.id,
                  voucher_id: cart.voucher_id
                }
              });
  
              userVoucher.amount = userVoucher.amount - 1;
              userVoucher.save({
                transaction: transaction
              });
              couponApplied = true;
            }
          }
        } else {
          subCart.voucher_discount = 0;
        }
  
        // Create order
        // capture the quotation to the order
        const quotation = foodItems[0]?.lalamove_quotation || null;
        subCart.quotation = JSON.stringify({
          quotation,
          shippingFee: foodItems[0]?.shipping_price || 0,
          currency: 'SGD',
        });
        
        // Set merchant id for order
        subCart.merchant_id = cartItems[0].product.merchants.id;
        // Plus shipping fee before create subcart
        // Shipping fee is not calculated into discount
        if (subCart.total < 0) {
          subCart.total = 0;
        }
        subCart.total += totalShippingFee;
        let subOrder = await db.models.orders.create(subCart, {
          transaction: transaction
        });
        shippingFeeByMerchant[subOrder.id] = totalShippingFee;

        // Temp obj for storing the variant
        // Cause we can have multiple variant of product in cart, each variant is a cartItem
        const productVariantUpdate = {}

        for(const cartItem of cartItems) {
          // Calculate setter price and store fee for order item
          const orderItemProduct = cartItem.product;
          const orderItemProductCategory = orderItemProduct.category;
          const { setterPrice, storeFeeAmount } = ProductService.calculateSetterPriceAndStoreFeeAmount({
            product: orderItemProduct,
            category: orderItemProductCategory,
          });
          // End calculate setter price and store fee for order item

          const { event } = cartItem;
          let shipping_price = 0;
          if (type === 1) {
            shipping_price = normalItemsShippingFee || 0;
          }
          if (type === 2) {
            shipping_price = cartItem.shipping_price;
          }
          const orderItem = {
            order_id: subOrder.id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            variant: cartItem.variant,
            item_price: cartItem.item_price,
            item_retail_price: cartItem.item_retail_price,
            // shipping_price: cartItem.shipping_price,
            // shipping_price: type === 1 ? normalItemsShippingFee || 0, // Used for jtexpress shipping fee
            shipping_price,
            status: 0,
            setter_price: setterPrice,
            category_fee: orderItemProductCategory.fee,
            store_fee_amount: storeFeeAmount,
          };

          if (event) {
            const { creted_at, updated_at, ...eventInfo } = event;
            orderItem.event = eventInfo;
          }

          await db.models.order_items.create(orderItem, {
            transaction: transaction
          });

          // Caculate remain product variant quantity
          const variant = productVariantUpdate[orderItemProduct.id] || orderItemProduct.variant;
          const productVariantIndex = variant[0].value.findIndex(({ name }) => name === cartItem.variant);
          const productVariant = variant[0].value[productVariantIndex];
          productVariant.quantity = productVariant.quantity - cartItem.quantity;
          variant[0].value[productVariantIndex] = productVariant;
          productVariantUpdate[orderItemProduct.id] = variant;
        }

        // Update product variant quantity
        if (Object.keys(productVariantUpdate).length) {
          for (const [productId, variant] of Object.entries(productVariantUpdate)) {
            db.models.products.update(
              {
                variant: JSON.stringify(variant),
              },
              {
                where: {
                  id: productId,
                },
                transaction: transaction,
              }
            );
          }
        }
        // End update product variant quantity
  
        await db.models.order_logs.create(
          {
            order_id: subOrder.id,
            title: "Order has been created",
            type: 0,
          },
          {
            transaction: transaction,
          }
        );
        
        orderData = subOrder.toJSON();
        
        // Create notifications for orders except last order
        const subCartKeyIndex = subCartKeys.indexOf(index);
        if (subCartKeyIndex < subCartKeyLength - 1) {
          const productAssets = await db.models.product_assets.findOne({
            where: {
              product_id: cartItems[0]? cartItems[0].product.id : null
            }
          });
          await db.models.notifications.create({
            user_id: orderData.user_id,
            ref_id: orderData.id,
            type: Notification.TYPE.ORDER_PLACED,
            target_user_id: null,
            title: 'Orders',
            description: 'Order has been created',
            summary: null,
            thumbnail: productAssets ? productAssets.url : null
          }, {
            transaction
          });
        }

        totalOrder += subCart.total
      }
  
      await transaction.commit();

      if (use_point) {
        const points = req.user.points;
        const totalAfterDiscount = rawTotalWithoutShippingFee - totalDiscount; 
        const usedPoint = Math.min(totalAfterDiscount * 1000, points)
        await db.models.orders.findAll({
          where: {
            code: orderCode
          }
        }).then(async ords => {
          let tempUsedPoint = usedPoint;
          let _c = 0;
          for (const ord of ords) {
            const { id } = ord;
            const ordShippingFee = shippingFeeByMerchant[id];
            const ordTotalWithoutShippingFee = ord.total - ordShippingFee;
            ord.point_used = _c !== ords.length - 1 ? Math.floor(ordTotalWithoutShippingFee / totalAfterDiscount * usedPoint) : tempUsedPoint;
            tempUsedPoint -= ord.point_used;
            ord.total -= ord.point_used / 1000;
            await ord.save()
            _c++
          }
        })
        
        totalOrder -= (usedPoint / 1000)
        // Update order column

        req.user.points = req.user.points - usedPoint;
        req.user.save()
      }
  
      const orders = await db.models.orders.findAll({
        where: {
          code: orderCode
        },
        include: ['order_logs', {
          as: 'order_items',
          model: db.models.order_items,
          include: ['product']
        }]
      })
      
      let batchPayment;
      
      if (totalOrder > 0) {
        orderData.total = totalOrder;
        orderData.user = req.user;
  
        // Create hitpay url for batch payment
        batchPayment = await HitpayHelper.createPayment(orderData);
        
        await db.models.order_payment_logs
          .create({
            transaction_id: batchPayment.id,
            order_id: orderData.id,
            response: batchPayment
          });
  
        await db.models.orders
          .update({
            batch_token: batchPayment.id
          }, {
            where: {
              code: orderCode
            }
          })
        
        for (const order of orders) {
          const singleOrderData = {
            user: req.user,
            total: order.total - order.point_discount
          }
  
          // Create hitpay url for every single order
          HitpayHelper.createPayment(singleOrderData)
            .then(payment => {
              db.models.order_payment_logs
                .create({
                  transaction_id: payment.id,
                  order_id: order.id,
                  response: payment
                });
              
              order.payment_url = payment.url;
              order.token = payment.id;
              order.save()
            }).catch(err => {
              console.error("Error creating single order payment", err)
            })
        }
        
      } else {
        db.models.orders.update({
          status: 1
        }, {
          where: {
            code: orderCode
          }
        })
      }
  
      // Clearing Cart
      await db.models.cart_items
        .destroy({
          where: {
            cart_id: cart.id
          },
        });
      cart.voucher_id = null;
      cart.save();
      // END clearing cart
  
      // Add Notification And User Address if didnt have. by frank
      await FCMHelper.addUserFcm(orderData.user_id, req.body.fcm_token, req.body.fcm_topics);
      if (!req.body.shipping_address) {
        await ShippingAddress.addOrderShippingAddress(orderData.user_id, req.body.shipping_address);
        await UserAddress.addBuyersAddress(orderData.id, user_id, req.body.shipping_address);
      }
      await Notification.createNotificationOrderUpdates(orderData, Notification.TYPE.ORDER_PLACED, null, "Orders", "Order has been created");
      
      return BaseResponse.Success(res, 'Order successfully created', {
        orders,
        batch_payment: batchPayment?.url
      });
    } catch (e) {
      console.log(e);
      if (transaction) {
        transaction.rollback();
      }
      
      return BaseResponse.BadResponse(res, e.message);
    }
  }
  
  async list(req, res) {
    let clause = {};
    clause.where = {};
    let userId = 0;
    if (req.user) {
      clause = {where: {user_id: req.user.id}};
      userId = req.user.id;
    }
    if (req.query.user_id) {
      clause = {where: {user_id: req.query.user_id}};
      userId = req.query.user_id;
    }
  
    clause.where.type = 1;
    
    const include = [
      {
        model: db.models.order_items,
        as: 'order_items',
        attributes: ['sub_total', 'status_name', 'id', 'order_id', 'product_id', 'variant', 'quantity',
          'item_price', 'shipping_price', 'status',
          [db.literal(`(
                              SELECT r.score
                              FROM product_reviews AS r
                              WHERE r.product_id = order_items.product_id
                              AND r.order_id = order_items.order_id
                              AND r.order_item_id = order_items.id
                          )`),
            'score']],
        // attributes: {
        //   include: [
        //     [
        //       db.literal(`(
        //             SELECT reviews.score
        //             FROM product_reviews AS reviews
        //             WHERE reviews.product_id = order_items.product_id
        //             AND reviews.order_id = order_items.order_id
        //         )`),
        //       'score'
        //     ]
        //   ]
        // },
        include: [{
          attributes: {
            include: [
              [
                db.literal(`(
                              SELECT AVG(r.score) as rating
                              FROM product_reviews AS r
                              WHERE r.product_id = order_items.product_id
                          )`),
                'rating'
              ]
            ]
          },
          model: db.models.products,
          as: 'product',
          include: [{
            model: db.models.product_assets,
            as: 'product_assets'
          }]
        }]
      }]
    const currentStatus = [ 0, 1, 2, 3, 7, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const passStatus = [4, 5, 6, 8, 11, 21, 22, 23];
    const formData = {
      type: (req.query.type ? req.query.type : ''),
      status: !isNaN(req.query.status) ? [parseInt(req.query.status)] : currentStatus,
    };
    
    if (formData.type) {
      formData.status = formData.type === 'past' ? passStatus : currentStatus;
    }
    
    if (formData.status) {
      clause.where = clause.where ?? {}
      clause.where.status = {
        [Op.in]: formData.status
      }
    }
    
    return await Pagination.paging(req, res, db.models.orders, clause, include);
  }
  
  async listOrderItems(req, res) {
    let clause = {};
    clause.where = {};
    let userId = 0;
    // const clause = req.user ? (req.user.role_id === 1 ? {} : {where: {user_id: req.user.id}}) : {where: {session_id: req.query.session_id}};
    if (req.query.order_id) clause.where.id = parseInt(req.query.order_id);
    if (req.query.user_id) clause.where.user_id = userId = parseInt(req.query.user_id);
    else if (req.user) clause.where.user_id = userId = parseInt(req.user.id);
    else if (req.query.session_id) clause.where.session_id = userId = parseInt(req.user.req.query.session_id);
    
    const include = [
      {
        model: db.models.order_items,
        as: 'order_items',
        attributes: {
          include: [
            [
              db.literal(`(
                    SELECT reviews.score
                    FROM product_reviews AS reviews
                    WHERE reviews.product_id = order_items.product_id
                    AND reviews.order_id = order_items.order_id
                    AND reviews.user_id = ${userId}
                )`),
              'score'
            ]
          ]
        },
        include: [{
          model: db.models.products,
          as: 'product',
          attributes: ['id', 'name', 'description', 'product_details', 'variant',
            [
              db.literal(`(
                  SELECT ANY_VALUE(pa.url)
                  FROM product_assets AS pa
                  WHERE pa.product_id = order_items.product_id
                  GROUP BY pa.product_id
              )`),
              'product_asset'
            ]]
        }]
      }]
    // const formData = validator.data;
    
    const formData = {
      type: (req.query.type ? req.query.type : ''),
      status: !isNaN(req.query.status) ? [parseInt(req.query.status)] : [0, 1, 2, 3]
    };
    
    if (formData.type) {
      formData.status = formData.type === 'past' ? [4, 5] : [0, 1, 2, 3];
    }
    
    if (formData.status) {
      // clause.where = clause.where ?? {}
      clause.where.status = {
        [Op.in]: formData.status
      }
    }
    
    // clause.attributes = attributes;
    return await Pagination.paging(req, res, db.models.orders, clause, include);
  }
  
  async detailMerchant(req, res) {
    let clause = {
      '$order_items.product.merchant_id$': req.user.merchants[0].id,
    }
  
    const orderId = req.params.order_id;
    let order = await db.models.orders.findOne({
      where: {
        ...clause,
        id: orderId,
      },
      include: ['billing_details', {
        model: db.models.order_items,
        as: 'order_items',
        include: [{
          model: db.models.products,
          as: 'product',
          include: ['product_assets', 'merchants']
        }, 'order_item_logs']
      }, {
        model: db.models.order_logs,
        as: 'order_logs'
      }, 'voucher']
    });
  
    if (order) {
      order = order.toJSON();
      order.order_items = order.order_items.map((item) => {
        item.subtotal = item.quantity * item.item_price;
        item.subtotal_retail_price = item.quantity * item.item_retail_price;
        return item;
      }).filter(item => item.product.merchant_id === req.user.merchants[0].id)
    
      order.order_logs = order.order_items[0].order_item_logs.sort((a, b) => (a.created_at > b.created_at) ? 1 : ((b.created_at > a.created_at) ? -1 : 0))
      let lastLogsDate = order.order_logs[order.order_logs.length - 1].created_at;
      if (!order.order_logs.find(log => log.title === 'Order successfully paid')) {
        lastLogsDate = moment(lastLogsDate).add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
        order.order_logs.push({
          title: 'Order Successfully Paid',
          estimate: `${moment(lastLogsDate).format('DD MMMM')} - ${moment(lastLogsDate).add(3, 'day').format('DD MMMM')}`
        })
      
      }
    
      if (!order.order_logs.find(log => log.title === 'Order Is Being Delivered')) {
        lastLogsDate = moment(lastLogsDate).add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
        order.order_logs.push({
          title: 'Order Is Being Delivered',
          estimate: `${moment(lastLogsDate).format('DD MMMM')} - ${moment(lastLogsDate).add(3, 'day').format('DD MMMM')}`
        })
      }
    
      if (!order.order_logs.find(log => log.title === 'Order Received')) {
        lastLogsDate = moment(lastLogsDate).add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
        order.order_logs.push({
          title: 'Order Received',
          estimate: `${moment(lastLogsDate).format('DD MMMM')} - ${moment(lastLogsDate).add(3, 'day').format('DD MMMM')}`
        })
      }
    
      order.total_retail_price = order.order_items
        .map(item => item.subtotal_retail_price)
        .reduce((prev, curr) => prev + curr, 0)
      order.total_shipping_price = order.order_items
        .map(item => item.shipping_price)
        .reduce((prev, curr) => prev + curr, 0)
      order.total_items = order.order_items
        .map(item => item.quantity)
        .reduce((prev, curr) => prev + curr, 0);
      order.total = order.order_items
        .map(item => item.subtotal)
        .reduce((prev, curr) => prev + curr, 0);
  
      order.grand_total = order.total + order.total_shipping_price;
    
      // Parsing and change order_items format
      const tempOrderItems = groupByFunc(order.order_items, 'product.merchant_id')
      const order_items = [];
      for(const tempIndex in tempOrderItems) {
        const temp = tempOrderItems[tempIndex]
        const merchant = temp[0].product.merchants;
        order_items.push({
          order_items_data: temp,
          merchant: merchant
        })
      }
      order.order_items = order_items;
    
      return BaseResponse.Success(res, 'Order retreived', {order})
    } else {
      return BaseResponse.NotFound(res, 'Order not found');
    }
  }
  
  async detail(req, res) {
    let clause = undefined;
    if (req.user) {
      if (req.user.is_superadmin) {
        clause = {};
      } else if (req.user.is_merchant) {
        clause = {
          [Op.or]: {
            '$order_items.product.merchant_id$': req.user.merchants[0].id,
            user_id: req.user.id
          }
        }
      } else {
        clause = {user_id: req.user.id};
      }
    } else {
      clause = {session_id: req.query.session_id ?? ''};
    }
    
    
    const orderId = req.params.order_id;
    let order = await db.models.orders.findOne({
      where: {
        ...clause,
        id: orderId,
      },
      include: ['billing_details', {
        model: db.models.order_items,
        as: 'order_items',
        include: [{
          model: db.models.products,
          as: 'product',
          include: ['product_assets', 'merchants']
        }, 'order_item_logs']
      }, {
        model: db.models.order_logs,
        as: 'order_logs'
      }, 'voucher', 'user']
    });
    
    if (order) {
      order = order.toJSON();
      order.order_items = order.order_items.map((item) => {
        item.subtotal = item.quantity * item.item_price;
        item.subtotal_retail_price = item.quantity * item.item_retail_price;
        return item;
      });
      
      order.order_logs = order.order_logs.sort((a, b) => (a.created_at > b.created_at) ? 1 : ((b.created_at > a.created_at) ? -1 : 0))
      
      // order logs for normal order
      if (order.type === 1) {
        let lastLogsDate = order.order_logs[order.order_logs.length - 1].created_at;
        if (!order.order_logs.find(log => log.title === 'Order successfully paid')) {
          lastLogsDate = moment(lastLogsDate).add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
          order.order_logs.push({
            title: 'Order Successfully Paid',
            estimate: `${moment(lastLogsDate).format('DD MMMM')} - ${moment(lastLogsDate).add(3, 'day').format('DD MMMM')}`
          })
    
        }
  
        if (!order.order_logs.find(log => log.title === 'Order Is Being Delivered')) {
          lastLogsDate = moment(lastLogsDate).add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
          order.order_logs.push({
            title: 'Order Is Being Delivered',
            estimate: `${moment(lastLogsDate).format('DD MMMM')} - ${moment(lastLogsDate).add(3, 'day').format('DD MMMM')}`
          })
        }
  
        if (!order.order_logs.find(log => log.title === 'Order successfully received')) {
          lastLogsDate = moment(lastLogsDate).add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
          order.order_logs.push({
            title: 'Order Received',
            estimate: `${moment(lastLogsDate).format('DD MMMM')} - ${moment(lastLogsDate).add(3, 'day').format('DD MMMM')}`
          })
        }
      } else if (order.type === 2) {
        let lastLogsDate = order.order_logs[order.order_logs.length - 1].created_at;
        if (!order.order_logs.find(log => log.title === 'Order successfully paid')) {
          lastLogsDate = moment(lastLogsDate).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss')
          order.order_logs.push({
            title: 'Order Successfully Paid',
            estimate: `${moment(lastLogsDate).format('DD MMMM, HH:mm')} - ${moment(lastLogsDate).add(30, 'minutes').format('DD MMMM, HH:mm')}`
          })
    
        }

        if (!order.order_logs.find(log => log.title === 'Order Is Being Delivered')) {
          lastLogsDate = moment(order.note?.delivery_time ?? order.created_at).format('YYYY-MM-DD HH:mm:ss')
          order.order_logs.push({
            title: 'Order Is Being Delivered',
            estimate: `${moment(lastLogsDate).format('DD MMMM, HH:mm')} - ${moment(lastLogsDate).add(10, 'minutes').format('DD MMMM, HH:mm')}`
          })
        }
  
        if (!order.order_logs.find(log => log.title === 'Order successfully received')) {
          lastLogsDate = moment(lastLogsDate).add(30, 'minute').format('YYYY-MM-DD HH:mm:ss')
          order.order_logs.push({
            title: 'Order Received',
            estimate: `${moment(lastLogsDate).format('DD MMMM, HH:mm')} - ${moment(lastLogsDate).add(20, 'minutes').format('DD MMMM, HH:mm')}`
          })
        }
      }
      
      order.grand_total = order.total;

      order.total_retail_price = order.order_items
        .map(item => item.subtotal_retail_price)
        .reduce((prev, curr) => prev + curr, 0)

      if (order.type === ORDER_TYPE.NORMAL) {
        // const shippingFee = CartService.getNormalItemShippingFeeByMerchant(order.order_items);
        const shippingFee = CartService.getNormalItemShippingFeeByMerchantBasedOnDeliveryService(order.order_items);
        // order.total_shipping_price = order.order_items
        //   .map(item => {
        //     const orderItemShippingFee = CartService.getNormalItemShippingFeeByDeliveryService(item);
        //     return item.quantity * orderItemShippingFee;
        //   }) //  item.shipping_price
        //   .reduce((prev, curr) => prev + curr, 0)
        order.total_shipping_price = shippingFee;
      }

      if (order.type === ORDER_TYPE.FOOD) {
        order.total_shipping_price = order.order_items[0].shipping_price;
      }

      order.total_items = order.order_items
        .map(item => item.quantity)
        .reduce((prev, curr) => prev + curr, 0);
      order.total = order.order_items
        .map(item => item.subtotal)
        .reduce((prev, curr) => prev + curr, 0);
  
      // Parsing and change order_items format
      const tempOrderItems = groupByFunc(order.order_items, 'product.merchant_id')
      const order_items = [];
      for(const tempIndex in tempOrderItems) {
        const temp = tempOrderItems[tempIndex]
        const merchant = temp[0].product.merchants;
        order_items.push({
          order_items_data: temp,
          merchant: merchant
        })
      }
      order.order_items = order_items;
      
      // order.grand_total = Math.max(order.grand_total - order.point_discount, 0)
      
      return BaseResponse.Success(res, 'Order retreived', {order})
    } else {
      return BaseResponse.NotFound(res, 'Order not found');
    }
  }
  
  async trackingDetail(req, res) {
    const orderItemId = req.params.order_item_id;
    const orderItem = await db.models.order_items
      .findOne({
        where: {
          id: orderItemId
        }
      });
    
    if (!orderItem) return BaseResponse.BadResponse(res, 'Order item not found');
    if (!orderItem.delivery_number || !orderItem.delivery_code) return BaseResponse.BadResponse(res, 'Order is still on processing');
    const trackingData = await Trackingmore.getSingleTrackingResult(orderItem.delivery_number, orderItem.delivery_code);
    return BaseResponse.Success(res, 'Success', {
      tracking: trackingData
    })
  }
  
  async refund(req, res) {
    const validator = await OrderValidator.validateRefund(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });
    
    const formData = validator.data;
    
    const order = await db.models.orders
      .findOne({
        where: {
          id: req.params.order_id
        },
        include: [{
          model: db.models.order_items,
          as: 'order_items',
          include: [{
            model: db.models.products,
            as: 'product',
            include: ['product_assets']
          }]
        }]
      });
    
    if (!order) return BaseResponse.BadResponse(res, 'Order not found');
    if (![0, 1].includes(order.status)) return BaseResponse.BadResponse(res, 'Order cannot be refunded');
    if (order.user_id !== req.user.id) return BaseResponse.BadResponse(res, 'You have no permission to cancel this order');
    
    const transaction = await db.transaction();
    try {
      order.status = 5;
      order.note = formData.message;
      await order.save({transaction: transaction});

      // If order is food order. Call API cancel to lalamove
      if (order.type === ORDER_TYPE.FOOD) {
        const orderRef = order.delivery_order_ref;
        if (orderRef) {
          await OrderService.cancelDeliveryOrder(orderRef);
        }
      }
      
      for (const item of order.order_items) {
        await db.models.products.update({
          available_qty: item.product.available_qty + item.quantity
        }, {
          where: {
            id: item.product_id
          },
          transaction: transaction
        });
        
        await db.models.order_items.update({status: order.status}, {where: {id: item.id}});
        
      }
      
      const order_logs = await db.models.order_logs
        .create({
          order_id: order.id,
          title: 'Order canceled by user',
          type: 0
        });

      const relativePaidOrder = await db.models.orders.findOne({
        where: {
          code: order.code,
          id: {
            [Op.ne]: order.id,
          },
          status: {
            [Op.ne]: ORDER_STATUS.PENDING,
            [Op.ne]: ORDER_STATUS.CANCELED,
          }
        }
      });

      if (!relativePaidOrder) {
        await OrderService.refundVoucher({ orderId: order.id, transaction });
      }

      await OrderService.refundPoints({ orderId: order.id, transaction });
      
      await transaction.commit();
      
      // TODO : Notification here
      // —-- Add notification for order <status>—-
      await Notification.createNotificationOrderUpdates(order.toJSON(), Notification.TYPE.ORDER_PLACED, null, "Orders", order_logs.title);
      //—————————--——————————
      
      return BaseResponse.Success(res, 'Order successfully refund');
    } catch (err) {
      transaction.rollback();
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async confirmOrder(req, res) {
    const order = await db.models.orders
      .findOne({
        where: {
          id: req.params.order_id
        },
        include: ['order_items']
      })
    
    if (!order) return BaseResponse.BadResponse(res, 'Order not found');
    
    if (order.user_id === req.user.id || req.user.is_superadmin) {
      order.status = 4;
      await db.models.order_items.update({
        status: 4
      }, {
        where: {
          order_id: order.id
        }
      });
      await order.save();
      db.models.order_logs.create({
        order_id: order.id,
        title: 'Order successfully received',
        type: 0
      })
      
      for (const item of order.order_items) {
        item.status = 4;
        item.save();
        db.models.order_item_logs.create({
          order_item_id: order.id,
          title: 'Order successfully received',
          type: 0
        });
      }
      
      // TODO : Notification here @Franklin
      
      return BaseResponse.Success(res, 'Order updated successfully');
    } else {
      return BaseResponse.BadResponse(res, 'You have no access in this order');
    }
  }
  
  async exportOrder(req, res) {
    const status = req.query.status || 2;
    let clause = {};
    if (status != -1) {
      clause.status = status;
    }
    
    if (req.user.is_merchant) {
      const merchant_id = req.user.merchants[0].id;
      const product_ids = (await db.models.products.findAll({
        attributes: ['id'],
        where: {
          merchant_id: merchant_id
        },
        raw: true
      })).map((product) => product.id);
      
      clause.product_id = {
        [Op.in]: product_ids
      }
    }
    
    const order_items = await db.models.order_items.findAll({
      where: clause,
      include: ['product', {
        model: db.models.orders,
        as: 'order',
        include: ['user', 'shipping_detail']
      }]
    })
    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("List of Processed Order");
    worksheet.columns = [
      {header: "Order Number", key: "order_number", width: 25},
      {header: "Item Name", key: "item_name", width: 25},
      {header: "Item Quantity", key: "item_quantity", width: 15},
      {header: "Item Price (Total)", key: "total_price", width: 20},
      {header: "Customer Name", key: "customer_name", width: 25},
      {header: "Shipping Address", key: "shipping_address", width: 25},
      {header: "Tracking Number", key: "tracking_number", width: 25},
      {header: "Phone", key: "phone", width: 25},
      {header: "Email", key: "email", width: 25},
      {header: "Item Detail Category", key: "item_detail", width: 25},
    ];
    
    const sheetData = [];
    for (const order_item of order_items) {
      // Filter dummy data (order without user)
      if (!order_item.order.user_id) continue;
      
      // Fix error when shipping detail not found (bad data)
      if (!order_item.order.shipping_detail) {
        order_item.order.shipping_detail = {}
      }
      
      sheetData.push({
        order_number: `ORD-${StrHelper.padNumber(order_item.order.id, 6)}`,
        item_name: order_item.product.name,
        item_quantity: order_item.quantity,
        total_price: order_item.item_price * order_item.quantity,
        customer_name: order_item.order.user.name,
        shipping_address: order_item.order.shipping_address ?? ' - ',
        tracking_number: order_item.order.delivery_number ?? ' - ',
        phone: order_item.order.user.contact_no ?? ' - ',
        email: order_item.order.user.email,
        item_detail: order_item.variant,
      })
    }
    
    worksheet.addRows(sheetData);
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `store-order-${moment().format('YYYY-MM-DD')}.xlsx`
    );
    
    await workbook.xlsx.write(res);
    
    res.status(200).end();
  }
  
  async hitpayWebhook(req, res) {
    // Get transaction id from request
    const transaction_id = req.body.payment_request_id;
    
    // Get order from transaction id
    const orders = await db.models.orders
      .findAll({
        where: {
          status: 0,
          [Op.or]: {
            token: transaction_id,
            batch_token: transaction_id
          }
        },
        include: ['order_items']
      })
    if (orders.length === 0) return BaseResponse.BadResponse(res, 'Order not found');
    let notified = false;
    let paymentMethods = [];
    let totalPaymentFees = 0;
    try {
      const paymentDetails = await HitpayHelper.getPaymentStatus(transaction_id);
      const { payments, status } = paymentDetails;
      const { methods, totalFees } = (payments || []).reduce((result, p) => {
        const { payment_type, fees } = p;
        let { methods, totalFees } = result;
        methods = [...methods, payment_type];
        totalFees += fees;
        return { methods, totalFees };
      }, { methods: [], totalFees: 0 });

      paymentMethods = [...methods];
      totalPaymentFees = totalFees;
    } catch(err) {
      console.log('Hitpay get payment details err: ', err);
    }
    // Add order payment logs
    for (const order of orders) {
      await db.models.order_payment_logs
        .create({
          order_id: order.id,
          transaction_id: transaction_id,
          response: req.body
        });
  
      if (req.body.status === 'completed') {
        // If order complete create order logs with title
        const order_logs = await db.models.order_logs
          .create({
            order_id: order.id,
            title: 'Order successfully paid',
            type: 0
          })
    
        for (const item of order.order_items) {
          await db.models.order_items.update({status: 1}, {where: {id: item.id}});
          db.models.order_item_logs
            .create({
              order_item_id: item.id,
              title: 'Order successfully paid',
              type: 0
            });
        }

        order.status = 1;
        order.payment_method = (paymentMethods || []).join(',') || null;
        order.payment_fee = totalPaymentFees || 0;
        await order.save();

        // if order has voucher
        // Update voucher used_count
        const voucherId = order.voucher_id;
        const appliedVoucher = await db.models.vouchers.findOne({ where: { id: voucherId } });
        // if (appliedVoucher) {
        //   const { used_count } = appliedVoucher;
        //   appliedVoucher.used_count = used_count + 1;
        //   await appliedVoucher.save();
        // }

        // Fire event create order with lalamove if this order is food
        if (order.type === ORDER_TYPE.FOOD) {
          // call create order with lalamove
          const quotation = order.quotation;
          const fee = quotation.shippingFee;
          const currency = quotation.currency;
          try {
            const lalamoveOrder = await OrderService.createOrderWithLalamove({
              order,
              quotation: quotation.quotation,
              fee,
              currency: currency || 'SGD',
            });
  
            order.delivery_order_ref = lalamoveOrder.orderRef;
            await order.save();
          } catch (err) {
            console.log('lalamove create order error. Order: ' + order.id);
          }
        }
        // End fire event create order with lalamove if this order is food
        const merchant = await db.models.merchants.findOne({ where: { id: order.merchant_id } });
        await Notification.createNotificationOrderUpdates(order.toJSON(), Notification.TYPE.ORDER_PAID, merchant?.user_id ?? null, "Orders", order_logs.title);
        // if (!notified) {
        //
        //   notified = true;
        // }
    
        const cart = await db.models.carts.findOne({
          where: {
            user_id: order.user_id
          }
        });
    
        await db.models.cart_items
          .destroy({
            where: {
              cart_id: cart.id
            }
          });
        cart.voucher_id = null;
        await cart.save();
    
      } else {
        // When order is failed to pay
        const order_logs = await db.models.order_logs
          .create({
            order_item_id: order.id,
            title: 'Payment failed',
            type: 0
          });
    
        for (const item of order.order_items) {
          await db.models.order_items.update({status: 5}, {where: {id: item.id}});
          db.models.order_item_logs
            .create({
              order_id: item.id,
              title: 'Payment failed',
              type: 0
            });
        }
    
        order.status = 5;
        await order.save();
        // How about order failed to pay?
    
        if(!notified){
          await Notification.createNotificationOrderUpdates(order.toJSON(), Notification.TYPE.PAYMENT_FAILED, null, "Orders", order_logs.title);
          notified = true;
        }
      }
    }
    
    console.log(req.query);
    console.log(req.body);
    res.send({ok: 'ok'})
  }
  
  async getFilterOrderListAdmin(req, res) {
    try {
      let clause = {
        where: {},
        distinct: true,
      }
      
      const include = [
        {
          model: db.models.users,
          as: 'user'
        },
        {
          model: db.models.order_items,
          as: 'order_items',
          attributes: {
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
          },
          include: [{
            model: db.models.products,
            as: 'product',
            include: [{
              model: db.models.product_assets,
              as: 'product_assets'
            },
              {
                model: db.models.product_reviews,
                as: 'product_reviews'
              }]
          }]
        },
        {
          model: db.models.product_reviews,
          as: 'product_reviews',
          include: [
            'product_review_replies',
          ]
        }
      ]
      
      // const formData = validator.data;
      const passStatus = [4,5,6,8,11];
      const formData = {
        type: (req.query.type ? req.query.type : ''),
        // status: !isNaN(req.query.status) ? [parseInt(req.query.status)] : currentStatus,
      };
      
      if (formData.type) {
        switch (formData.type) {
          case 'past': {
            formData.status = passStatus;
            break;
          }
          case 'all': {
            // formData.status = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            break;
          }
          default: {
            break;
          }
        }
      }
      
      if (req.query.status) {
        clause.where = clause.where ?? {}
        clause.where.status = {
          [Op.in]: Array.isArray(req.query.status) ? req.query.status : [req.query.status],
        }
      }
      
      if (req.user.is_merchant) {
        const merchant_id = req.user.merchants[0].id;
        // const merchant = await db.models.merchants.findOne({
        //   where: {
        //     user_id: req.user.id
        //   }
        // });
        
        const product_ids = (await db.models.products.findAll({
          where: {
            merchant_id: merchant_id
          },
          attributes: ['id'],
          raw: true
        })).map(product => product.id);
        
        // clause.where['$order_items.product_id$'] = {
        //   [Op.in]: product_ids
        // }
        const order_ids = (await db.models.order_items.findAll({
          where: {
            product_id: {[Op.in]: product_ids}
          },
          attributes: ['order_id'],
          raw: true
        })).map(order => order.order_id);
        
        clause.where.id = {[Op.in]: order_ids};
      }
      
      // Caculate avg_rating for order
      clause.attributes = {
        include: [
          [
            db.literal(`(
                  SELECT ROUND(AVG(reviews.score),1)
                  FROM product_reviews AS reviews
                  WHERE reviews.order_id = orders.id
              )`),
            'avg_rating'
          ]
        ]
      };
  
      const { keyword } = req.query;
      if (keyword) {
        clause.where.id = { [Op.like]: `%${keyword.trim()}%` };
      }
  
      
      if (req.query.order_id) clause.where.id = parseInt(req.query.order_id);
      
      if (req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0) {
        return Pagination.paging(req, res, db.models.orders, clause, include);
      } else {
        clause.include = include;
        const orderlists = await db.models.orders.findAll(clause);
        return BaseResponse.Success(res, 'Order List', {
          data: orderlists
        });
      }
    } catch (err) {
      console.log('err: ', err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async setOrderPast(req, res) {
    if (!req.query.order_id) return BaseResponse.BadResponse(res, 'Order Id is required!');
    
    return await db.models.orders.findOne({
        where: {
          id: parseInt(req.query.order_id)
        },
        include: ['order_items']
      })
      .then(async (order) => {
        if (!order) return BaseResponse.BadResponse(res, 'Order not found!');
        // if(order.status == 4){
        
        for (const item of order.order_items) {
          await db.models.order_items.update({status: 5}, {where: {id: item.id}});
        }
        
        return await order.update({status: 5})
          .then(async (info) => {
            const updated_order = await db.models.orders.findOne({
              where: {
                id: parseInt(req.query.order_id)
              },
              include: ['order_items']
            });
            return BaseResponse.Success(res, 'Order status successfully updated to past!', {
              data: updated_order
            });
          })
          .catch(err => {
            return BaseResponse.BadResponse(res, err.message);
          });
        // }
        // return BaseResponse.BadResponse(res, "Can't set status to past of orders in not yet received");
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      });
  }
  
  async setOrderCompleted(req, res) {
    if (!req.query.order_id) return BaseResponse.BadResponse(res, 'Order Id is required!');
    
    return await db.models.orders.findOne({
        where: {
          id: parseInt(req.query.order_id)
        },
        include: ['order_items']
      })
      .then(async (order) => {
        if (!order) return BaseResponse.BadResponse(res, 'Order not found!');
        // if(order.status == 4){
        
        for (const item of order.order_items) {
          await db.models.order_items.update({status: 4}, {where: {id: item.id}});
        }
        
        return await order.update({status: 4})
          .then(async (info) => {
            const updated_order = await db.models.orders.findOne({
              where: {
                id: parseInt(req.query.order_id)
              },
              include: ['order_items']
            });
            
            await db.models.order_logs.create({
              order_id: parseInt(req.query.order_id),
              title: 'Order successfully received',
              type: 0
            })
            
            return BaseResponse.Success(res, 'Order received and status successfully updated to completed!', {
              data: updated_order
            });
          })
          .catch(err => {
            return BaseResponse.BadResponse(res, err.message);
          });
        // }
        // return BaseResponse.BadResponse(res, "Can't set status to past of orders in not yet received");
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      });
  }
  
  async setOrderItemStatus(req, res) {
    if (!req.user.is_superadmin) return BaseResponse.BadResponse(res, "You're not allowed to access this api if you don't a superadmin");
    if (!req.query.order_item_id) return BaseResponse.BadResponse(res, 'Order Item Id is required!');
    if (!req.body.status) return BaseResponse.BadResponse(res, 'Status is required!');
    
    return await db.models.order_items.update({status: parseInt(req.body.status)}, {where: {id: parseInt(req.query.order_item_id)}})
      .then(order_item => {
        if (order_item) {
          return BaseResponse.Success(res, 'Order Item status successfully updated!');
        } else return BaseResponse.BadResponse(res, 'Order Item status Unsuccessfully updated!');
      })
      .catch(err => {
        return BaseResponse.BadResponse(res, err.message);
      });
    
  }
  
  async downloadListOfCourier(req, res) {
    let couriers = [];
    // Caching file
    if (fs.existsSync(path.resolve('storage/tmp/couriers.json'))) {
      couriers = JSON.parse(fs.readFileSync(path.resolve('storage/tmp/couriers.json')));
    } else {
      couriers = await Trackingmore.getCourierList();
      fs.writeFileSync(path.resolve('storage/tmp/couriers.json'), JSON.stringify(couriers));
    }
    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("List of Couriers");
    worksheet.columns = [
      {header: "Name", key: "name", width: 25},
      {header: "Code", key: "code", width: 25},
      {header: "Phone", key: "phone", width: 15},
      {header: "Country", key: "country", width: 25},
      {header: "URL", key: "url", width: 20}
    ];
    
    const sheetData = [];
    for (const courier of couriers) {
      if (courier.country_code !== 'SG') continue;
      sheetData.push({
        name: courier.name,
        code: courier.code,
        phone: courier.phone,
        country: courier.country_code,
        url: courier.homepage
      })
    }
    
    worksheet.addRows(sheetData);
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `List of Courier.xlsx`
    );
    
    await workbook.xlsx.write(res);
    
    res.status(200).end();
  }
  
  async downloadOrderDeliveryTemplate(req, res) {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("List of Order");
    worksheet.columns = [
      {header: "Order ID", key: "order_id", width: 25},
      {header: "Delivery Number", key: "delivery_code", width: 25},
      {header: "Delivery Tracking Code", key: "delivery_tracking", width: 25}
    ];
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `Order Template.xlsx`
    );
    
    await workbook.xlsx.write(res);
    
    res.status(200).end();
  }
  
  async uploadOrderDelivery(req, res) {
    const validator = OrderValidator.validateUploadOrderDelivery(req);
    if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
      errors: validator.error
    });
    
    const formData = validator.data;
    
    const workbook = new excel.Workbook();
    await workbook.xlsx.readFile(formData.file.tempFilePath);
    
    const data = [];
    for (const row of workbook.worksheets[0].getRows(2, 5)) {
      const orderId = row.getCell(1).value;
      const deliveryNumber = row.getCell(2).value;
      const deliveryCode = row.getCell(3).value;
      if (!orderId || !deliveryNumber || !deliveryCode) continue;
      
      data.push({
        order_id: orderId,
        delivery_number: deliveryNumber,
        delivery_code: deliveryCode
      })
    }

    const orderCodes = data.map(row => row.order_id);
    
    const order_items = await db.models.order_items
      .findAll({
        where: {
          '$product.merchant_id$': req.user.merchants[0].id,
          '$order.code$': {
            [Op.in]: orderCodes
          }
        },
        include: ['product', {
          model: db.models.orders,
          as: 'order',
          include: ['user']
        }]
      });
    
    let couriers = [];
    if (fs.existsSync(path.resolve('storage/tmp/couriers.json'))) {
      couriers = JSON.parse(fs.readFileSync(path.resolve('storage/tmp/couriers.json')));
    } else {
      couriers = await Trackingmore.getCourierList();
      fs.writeFileSync(path.resolve('storage/tmp/couriers.json'), JSON.stringify(couriers));
    }
    try {
      let trackingRequests = [];
      for (const order_item of order_items) {
        const inputData = data.find(row => row.order_id === order_item.order.code);
        const courier = couriers.find(courier => courier.code === inputData.delivery_code);
        if (!courier) continue;
        
        order_item.delivery_number = inputData.delivery_number;
        order_item.delivery_code = inputData.delivery_code;
        order_item.save();
        
        
        trackingRequests.push({
          tracking_number: inputData.delivery_number,
          carrier_code: inputData.delivery_code,
          title: `Store Backend : ${order_item.product.name}`,
          customer_name: order_item.order.user.name,
          customer_email: order_item.order.user.email,
          order_id: order_item.order.id
        })
      }
      
      trackingRequests = ArrayHelper.chunk(trackingRequests, 30);
      const promises = [];
      for (const trackingRequest of trackingRequests) {
        Trackingmore.createMultipleTracking(trackingRequest)
          .then(data => {
            const trackingMoreErrors = data.errors || [];
            for (const error of trackingMoreErrors) {
              if (error.code === 4016) {
                const promise = db.models.order_items.findAll({
                  where: {
                    delivery_number: error.tracking_number,
                    delivery_code: error.carrier_code
                  }
                }).then(orderItems => {
                  const ids = orderItems.map(oi => oi.id);
                  db.models.order_items.update(
                    { status: 3 },
                    {
                      where: {
                        id: {
                          [Op.in]: ids,
                        }
                      }
                    }
                  );

                  ids.map(id => db.models.order_item_logs.create({
                    order_item_id: id,
                    title: "Order is on delivery",
                    type: 0,
                  }));
                }).catch(err => {
                  console.log('update order item by uploading csv error: ', err);
                });

                promises.push(promise);
              }
            }
            
            for (const tracking of data.trackings) {
              const promise = db.models.order_items.findAll({
                where: {
                  delivery_number: tracking.tracking_number,
                  delivery_code: tracking.carrier_code
                }
              }).then(orderItems => {
                const ids = orderItems.map(oi => oi.id);
                db.models.order_items.update(
                  { status: 3 },
                  {
                    where: {
                      id: {
                        [Op.in]: ids,
                      }
                    }
                  }
                );

                ids.map(id => db.models.order_item_logs.create({
                  order_item_id: id,
                  title: "Order is on delivery",
                  type: 0,
                }));
              }).catch(err => {
                console.log('update order item by uploading csv error: ', err);
              });;

              promises.push(promise);
            }
          })
      }

      // Update order status to shipped after upload
      Promise.all(promises).then(() => {
        db.models.orders.update({
          status: 3,
        }, {
          where: {
            code: {
              [Op.in]: orderCodes,
            }
          }
        });
      })

      return BaseResponse.Success(res, 'Upload Successfully');
    } catch (err) {
      console.error(err)
      return BaseResponse.BadResponse(res, 'Upload failed');
    }
  }
  
  async updateDeliveryWebhook(req, res) {
    const data = req.body;
    if (data.verify.usertag !== process.env.TRACKINGMORE_USERTAG) return BaseResponse.BadResponse(res, 'Verification failed');
    if (data.data.delivery_status === 'delivered') {
      console.log(data.data.tracking_number, data.data.courier_code, 'Updated')
      db.models.order_items.update({
        status: 4
      }, {
        where: {
          delivery_number: data.data.tracking_number,
          delivery_code: data.data.courier_code
        }
      })
    }
    
    // const trackingmoreEmail = process.env.TRACKINGMORE_EMAIL || 'cibaicode321@gmail.com';
    // const verify = crypto.createHmac('sha256', `${data.verify.timestamp}`).update(`${trackingmoreEmail}`).digest('hex');
    // console.log(verify)
    return BaseResponse.Success(res, 'Ok')
  }

  async processedOrder(req, res, next) {
    let transaction = null;
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      const order = await OrderService.getSingleOrder({
        where: {
          id,
        }
      });

      if (!order) {
        return BaseResponse.NotFound(res, 'Order not found');
      }

      if (order.status !== ORDER_STATUS.PAYMENT_ACCEPTED) {
        return BaseResponse.BadResponse(res, 'Order is not payment accepted order');
      }

      transaction = await db.transaction();
      order.status = ORDER_STATUS.PROCESSED;
      await order.save({
        transaction,
      });

      const updatedOrderItems = await OrderItemService.updateOrderItemStatusByOrder({
        orderId: order.id,
        status: order.status,
        transaction,
      });


      const order_logs = await db.models.order_logs
        .create({
          order_id: order.id,
          title: 'Order successfully processed',
          type: 0
        }, {
          transaction,
        });

      await transaction.commit();

      return BaseResponse.Success(res, 'Update order with processed status successfully.', {data: order});

    } catch (err) {
      if (transaction) {
        transaction.rollback();
      }

      return BaseResponse.BadResponse(err);
    }
  }

  async setShippedOrder(req, res, next) {
    let transaction = null;
    try {
      const {id} = req.params;
      const { delivery_number, delivery_code } = req.body;

      // if (!id || !delivery_number || !delivery_code) {
      //   return BaseResponse.BadRequest(res, 'Missing params.');
      // }

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const order = await OrderService.getSingleOrder({
        where: {
          id,
        },
        include: [
          {
            model: db.models.users,
            as: 'user'
          },
          {
            model: db.models.merchants,
            as: 'merchant',
            include: ['user']
          },
          {
            model: db.models.order_items,
            as: 'order_items',
            include: ['product'],
          }
        ]
      });

      if (!order) {
        return BaseResponse.NotFound(res, 'Order not found');
      }

      // if (order.status !== ORDER_STATUS.PROCESSED) {
      //   return BaseResponse.BadResponse(res, 'Order is not processed order');
      // }

      // const createdTrackingMore = await Trackingmore.createSingleTracking(delivery_number, delivery_code);
      // const {tracking_number, carrier_code} = createdTrackingMore || {};

      // if (!tracking_number || !carrier_code) {
      //   return BaseResponse.BadResponse(res, 'Cannot create tracking data.');
      // }

      // const merchant = (req.user.merchants || [])[0] ?? {};
      const merchant = order.merchant || {}; // Allow admin to change the status
      const merchantId = merchant.id;

      // Create order to qxpress for delivery
      const { user, shipping_address } = order;
      const { office_address, postal_code, office_phone_number } = merchant;
      const zipcode = shipping_address.split(', ');

      if (!merchantId || !postal_code) {
        return BaseResponse.BadResponse(res, 'Please update your postal code.');
      }

      const userPhoneArr = user.contact_no.split(' ');
      const merchantPhoneArr = office_phone_number && office_phone_number.length > 5
        ? office_phone_number.split(' ')
        : (merchant.user.contact_no || '').split(' ');

      const exampleData = {
        senderCountryCode: 'SG',
        refOrderNo: `${order.id}`,
        rcptName: user.name,
        rcptCountryCode: 'SG',
        rcptAddr1: order.shipping_address,
        rcptAddr2: order.shipping_address,
        rcptZipcode: `${zipcode[zipcode.length - 1]}`,
        rcptMobile: `${userPhoneArr[1]}`,
        rcptPhone: `${userPhoneArr[1]}`,
        rcptEmail: user.email,
        svcType: 'RM',
        contents: `BMart Order ${order.id}`,
        qty: 1,
        parcelAmount: order.total,
        currency: 'SGD',
        merchantName: merchant.name,
        merchantPhone: merchantPhoneArr[1],
        merchantEmail: merchant.user.email,
        merchantAddress: office_address,
        merchantPostalCode: postal_code,
        orderItems: order.order_items,
      };

      const deliveryOrderData = DeliveryService.prepareDeliveryOrderData(exampleData);

      const deliveryOrder = await DeliveryService.createDeliveryOrder(deliveryOrderData);
      // const { ShippingNo, AreaCode } = qxpressOrder || {};
      const { data, success, error } = deliveryOrder;
      //   {
      //     "tracking_id": "JNT20201540001078",
      //     "reference_number": "1TEST015",
      //     "sorting_code":"60A"
      // }

      if (!success) {
        console.log('Cannot get shipping no from qxpress');
        return BaseResponse.BadResponse(res, error.message || error || 'Something went wrong. Please try again later');
      }
      
      const { tracking_id, reference_number, sorting_code } = data;

      const orderItems = await OrderItemService.getOrderItems({
        where: {
          order_id: id,
          status: ORDER_STATUS.PROCESSED,
        },
        include: [
          {
            model: db.models.products,
            as: 'product',
            where: {
              merchant_id: merchantId,
            }
          }
        ]
      });

      transaction = await db.transaction();

      order.status = ORDER_STATUS.SHIPPED;
      order.delivery_order_ref = tracking_id;
      order.sorting_code = sorting_code;
      await order.save({
        transaction,
      });

      const orderItemIds = orderItems.map(item => item.id);
      await OrderItemService.updateOrderItems({
        data: {
          status: ORDER_STATUS.SHIPPED,
          // delivery_number: tracking_number,
          // delivery_code: carrier_code,
        },
        where: {
          id: {
            [Op.in]: orderItemIds
          }
        },
        transaction,
      });

      const order_logs = await db.models.order_logs
        .create({
          order_id: order.id,
          // title: 'Order successfully shipped',
          title: 'Waiting for picked up',
          type: 0
        }, {
          transaction,
        });

      await transaction.commit();

      return BaseResponse.Success(res, 'Shipped success', {data: order});


    } catch (err) {
      console.log('set shipped status err: ', err);
      if (transaction) {
        transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async resolveOrderLogs(req, res){
    const existsLogs = await db.models.order_item_logs.findAll({
      attributes: ['order_item_id']
    }).then(res => {
      return res.map(log => log.order_item_id)
    });
    
    let orderItems = await db.models.order_items.findAll({
      where: {
        order_id: {
          [Op.notIn]: existsLogs
        }
      },
      include: [{
        as: 'order',
        model: db.models.orders,
        include: ['order_logs']
      }]
    });
    
    for (const orderItem of orderItems) {
      const logs = orderItem.toJSON().order.order_logs
        .map(log => {
          delete log.id;
          delete log.order_id;
          log.order_item_id = orderItem.id;
          return log;
        })
      db.models.order_item_logs.bulkCreate(logs)
    }
    
    
    res.send({
      message: 'orderItems'
    })
  }

  async getOrderReviews(req, res, next) {
    try {
      const {id} = req.params;

      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const includes = [
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
          as: 'product',
          model: db.models.products,
          attributes: ['id', 'name', 'code', 'merchant_id'],
          include: ['product_assets']
        },
        {
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
        },
        {
          model: db.models.review_assets,
          as: 'assets',
        }
      ];

      const clause = {
        where: {
          order_id: id,
        },
        order: [['created_at', 'desc']],
      };
      return Pagination.paging(req, res, db.models.product_reviews, clause, includes)
    } catch (err) {
      console.log(err);
      return BaseResponse.BadRequest(res, err.message);
    }
  }
  
  async getFoodOrderList(req, res) {
    let clause = {};
    clause.where = {};
    let userId = 0;
    if (req.user) {
      clause = {where: {user_id: req.user.id}};
      userId = req.user.id;
    }
    if (req.query.user_id) {
      clause = {where: {user_id: req.query.user_id}};
      userId = req.query.user_id;
    }
    
    clause.where.type = 2;
  
    const include = [
      {
        model: db.models.order_items,
        as: 'order_items',
        attributes: ['sub_total', 'status_name', 'id', 'order_id', 'product_id', 'variant', 'quantity',
          'item_price', 'shipping_price', 'status',
          [db.literal(`(
                              SELECT r.score
                              FROM product_reviews AS r
                              WHERE r.product_id = order_items.product_id
                              AND r.order_id = order_items.order_id
                          )`),
            'score']],
        include: [{
          attributes: {
            include: [
              [
                db.literal(`(
                              SELECT AVG(r.score) as rating
                              FROM product_reviews AS r
                              WHERE r.product_id = order_items.product_id
                          )`),
                'rating'
              ]
            ]
          },
          model: db.models.products,
          as: 'product',
          include: [{
            model: db.models.product_assets,
            as: 'product_assets'
          }]
        }]
      }]
  
    const formData = {
      type: (req.query.type ? req.query.type : ''),
      status: !isNaN(req.query.status) ? [parseInt(req.query.status)] : [0, 1, 2, 3]
    };
  
    if (formData.type) {
      formData.status = formData.type === 'past' ? [4, 5] : [0, 1, 2, 3];
    }
  
    if (formData.status) {
      clause.where = clause.where ?? {}
      clause.where.status = {
        [Op.in]: formData.status
      }
    }
    
    return Pagination.paging(req, res, db.models.orders, clause, include)
  }

  async settementReport(req, res) {
    const status = req.query.status || 4;
    const { start_date, end_date } = req.query;
    let start = start_date ? moment(start_date).utcOffset(8).startOf('day') : moment().utcOffset(8).startOf('month');
    let end = end_date ? moment(end_date).utcOffset(8).endOf('day') : moment().utcOffset(8).endOf('month');

    const orders = await OrderService.getOrders({
      where: {
        status,
        created_at: {
          [Op.and]: [
            {
              [Op.gte]: start.toISOString(),
            },
            {
              [Op.lte]: end.toISOString(),
            }
          ],
        },
      },
      include: [
        {
          model: db.models.order_items,
          as: 'order_items',
        },
        {
          model: db.models.merchants,
          as: 'merchant',
          attributes: ['id', 'name']
        }
      ]
    });

    const ordersByMerchant = groupByFunc(orders, 'merchant.id');
    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("List of Processed Order");
    worksheet.columns = [
      {header: "Date", key: "created_at", width: 25},
      {header: "Merchant", key: "merchant_name", width: 25},
      {header: "Merchant ID", key: "merchant_id", width: 15},
      {header: "Cart ID", key: "order_id", width: 20},
      {header: "Actual Amount ($)", key: "total", width: 25},
      {header: "Redeemtion Points ($)", key: "redeem_points_amount", width: 25},
      {header: "Redeemtion Vouchers ($)", key: "redeem_voucher_amount", width: 25},
      {header: "Marketing Flash Deal Discount", key: "marketing_discount_value", width: 25},
      {header: "Amount After Redeemtion ($)", key: "amount_after_redeemtion", width: 25},
      {header: "B Mart Success Fee (5%)", key: "store_fee", width: 25},
      {header: "Net Amount Merchant Join Flash Deal", key: "flash_deal_merchant_amount", width: 25},
      {header: "Net Amount Due to Merchant", key: "merchant_amount", width: 25},
      {header: "Payment Method", key: "payment_method", width: 25},
      {header: "Charges", key: "payment_fee", width: 25},
      {header: "Net Amt Received From Hipay", key: "net_received_from_payment", width: 25},
      {header: "Promo Code Use", key: "promo_code", width: 25},
    ];

    const sheetData = [];
    Object.values(ordersByMerchant).forEach(merchantOrders => {
      let totalAmountByMerchant = 0;
      let totalRedeemPointsAmountByMerchant = 0;
      let totalRedeeemVoucherAmountByMerchant = 0;
      let totalAmountAfterRedeemtionByMerchant = 0;
      let totalStoreFeeByMerchant = 0;
      let totalMerchantAmountByMerchant = 0;
      let totalPaymentChargesByMerchant = 0;
      let totalNetReceivedFromPaymentByMerchant = 0;
      let totalNetAmountMerchantJoinFlashDeal = 0;
      let totalMerketingDiscountValue = 0;

      // Loop through each order to calculating and create the report
      merchantOrders.forEach(order => {
        // const { merchant = {}, order_items } = order;

        // NOTE:
        // order.total is amount after minus voucher discount
        // order.point_used is amount of points use. (1000 points = $1)

        const orderReport = OrderService.calculateSettementReportForOrder(order);
        const {
          created_at,
          merchant_name,
          merchant_id,
          order_id,
          actual_amount,
          redeem_points_amount,
          redeem_voucher_amount,
          store_fee,
          merchant_amount,
          order_payment_method,
          payment_fee,
          net_received_from_payment,
          promo_code,
          amount_after_redeemtion,
          marketingJoinFlashDealAmount,
          merchantJoinFlashDealAmount,
        } = orderReport;

        const row = {
          created_at,
          merchant_name,
          merchant_id,
          order_id,
          total: roundDecimal(actual_amount, -2),
          redeem_points_amount: roundDecimal(redeem_points_amount, -2),
          redeem_voucher_amount: roundDecimal(redeem_voucher_amount, -2),
          amount_after_redeemtion: roundDecimal(amount_after_redeemtion, -2),
          store_fee: roundDecimal(store_fee, -2),
          merchant_amount: roundDecimal(merchant_amount, -2),
          payment_method: order_payment_method,
          payment_fee: roundDecimal(payment_fee, -2),
          net_received_from_payment: roundDecimal(net_received_from_payment, -2),
          promo_code,
          marketing_discount_value: marketingJoinFlashDealAmount,
          flash_deal_merchant_amount: merchantJoinFlashDealAmount
        };

        // Calculate total row
        totalAmountByMerchant += actual_amount;
        totalRedeemPointsAmountByMerchant += redeem_points_amount;
        totalRedeeemVoucherAmountByMerchant += redeem_voucher_amount;
        totalMerketingDiscountValue += marketingJoinFlashDealAmount;
        totalAmountAfterRedeemtionByMerchant += amount_after_redeemtion;
        totalStoreFeeByMerchant += store_fee;
        totalMerchantAmountByMerchant += merchant_amount;
        totalPaymentChargesByMerchant += payment_fee;
        totalNetReceivedFromPaymentByMerchant += net_received_from_payment;
        totalNetAmountMerchantJoinFlashDeal += merchantJoinFlashDealAmount;

        sheetData.push(row);
      });

      const totalRow = {
        created_at: 'Total',
        merchant_name: '',
        merchant_id: '',
        order_id: '',
        total: roundDecimal(totalAmountByMerchant, -2),
        redeem_points_amount: roundDecimal(totalRedeemPointsAmountByMerchant, -2),
        redeem_voucher_amount: roundDecimal(totalRedeeemVoucherAmountByMerchant, -2),
        amount_after_redeemtion: roundDecimal(totalAmountAfterRedeemtionByMerchant, -2),
        store_fee: roundDecimal(totalStoreFeeByMerchant, -2),
        merchant_amount: roundDecimal(totalMerchantAmountByMerchant, -2),
        payment_method: '',
        payment_fee: roundDecimal(totalPaymentChargesByMerchant, -2),
        net_received_from_payment: roundDecimal(totalNetReceivedFromPaymentByMerchant, -2),
        promo_code: '',
        marketing_discount_value: roundDecimal(totalMerketingDiscountValue, -2),
        flash_deal_merchant_amount: roundDecimal(totalNetAmountMerchantJoinFlashDeal, -2),
      }

      sheetData.push(totalRow);
    });

    
    worksheet.addRows(sheetData);
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `store-order-${moment().format('YYYY-MM-DD')}.xlsx`
    );
    
    await workbook.xlsx.write(res);
    
    res.status(200).end();
  }

  async merchantCancelOrder(req, res, next) {
    let transaction = null;
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      if (!id || !status || !note) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const order = await OrderService.getSingleOrder({
        where: { id }
      });

      if (!order) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      transaction = await db.transaction();

      // Cancel delivery order if order is shipped
      if (order.delivery_order_ref) {
        // call API cancel delivery order
        const cancelRequestBody = DeliveryService.prepareCancelDeliveryOrderData([order.delivery_order_ref], note);
        const cancelResult = await DeliveryService.cancelDeliveryOrder(cancelRequestBody);
        const { success, error } = cancelResult;
        if (!success) {
          return BaseResponse.BadResponse(res, error.message);
        }
      }

      order.status = status;
      order.note = note;

      await order.save({ transaction });

      await OrderService.refundVoucher({ orderId: id, transaction });
      await OrderService.refundPoints({ orderId: id, transaction });

      await db.models.order_items.update({
        status: status,
      }, {
        where: {
          order_id: order.id
        },
        transaction,
      });

      const order_logs = await db.models.order_logs
        .create({
          order_id: order.id,
          title: 'Order canceled by merchant',
          type: 0
        }, {
          transaction
        });

      await transaction.commit();

      return BaseResponse.Success(res, 'Cancel order success.', { data: order });
    } catch (err) {
      if (transaction) {
        transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async printWaybill(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const order = await OrderService.getSingleOrder({
        where: { id }
      });

      if (!order) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const { delivery_order_ref, status } = order;
      if (status !== ORDER_STATUS.SHIPPED) {
        return BaseResponse.BadResponse(res, 'Order not shipped');
      }

      if (!delivery_order_ref) {
        return BaseResponse.BadResponse(res, 'Missing delivery number');
      }

      const result = await DeliveryService.getWaybill(delivery_order_ref);
      return BaseResponse.Success(res, 'Get waybill successfully', { data: result });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new OrderHandler();
