const moment = require('../../configs/moment');
const {Op} = require("sequelize");
const groupByFunc = require('lodash.groupby');

const db = require('../../configs/sequelize');
const CartValidator = require('../../validators/cart');

const FoodDeliveryService = require('../../services/lalamove.service');
const CartService = require('../../services/cart.service');
const DeliveryService = require('../../services/delivery.service');
const EventsService = require('../../services/events.service');
const EventItemsService = require('../../services/event_items.service');

const { validatePhoneNumber } = require('../../utils/helpers');
const { PRODUCT_TYPES, EVENT_STATUS, EVENT_TYPES, EVENT_ITEM_STATUS, EVENT_ITEM_TYPES } = require('../../configs');

async function getAndCalculateCart(clause, use_point = false, receiver, receiverAddress = null){
  const now = moment();
  let cart = await db.models.carts.findOne({
    where: clause,
    include: [
      {
        model: db.models.vouchers,
        as: 'voucher'
      },
      {
        model: db.models.cart_items,
        as: 'cart_items',
        include: [
          {
            attributes: {
              include: [
                [
                  db.literal(`(
                            SELECT AVG(r.score) as rating
                            FROM product_reviews AS r
                            WHERE r.product_id = cart_items.product_id
                        )`),
                  'rating'
                ]
              ]
            },
            model: db.models.products,
            as: 'product',
            include: [
              'product_assets',
              {
                model: db.models.merchants,
                as: 'merchants',
                include: [
                  {
                    model: db.models.users,
                    as: 'user',
                    attributes: ['contact_no', 'name']
                  }
                ]
              }
            ]
          },
          // {
          //   model: db.models.events,
          //   as: 'event',
          // }
        ]
      },
      {
        model: db.models.user_addresses,
        as: 'address',
      }
    ]
  });
  
  cart = cart.toJSON();
  const currentFlashDeal = await EventsService.getActiveFlashDeal();
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
    cart.cart_items = cart.cart_items.map(cartItem => {
      if (eventItemIds.includes(+cartItem.product_id)) {
        cartItem.event = currentFlashDeal;
      } else {
        cartItem.event = null;
      }
      return cartItem;
    });
  }

  let point = null
  
  if (use_point) {
    const user = await db.models.users.findOne({
      where: {
        id: clause.user_id
      }
    });

    point = user ? user.points : 0
  }

  if (cart.cart_items && cart.cart_items.length > 0) {

    // Separate food and normal shops
    const {cart_items} = cart;
    const [ normalItems, foodItems ] = CartService.separateCartItemByFoodAndNormalShops(cart_items);

    const normalItemTotalQuantity = normalItems.reduce((result, item) => {
      const data = { ...item };
      const { quantity, id, product } = item;
      const productId = product.id;
      if (!result[productId]) {
        result[productId] = 0;
      }

      result[productId] += quantity;

      return result;
    }, {});

    // Calculate price for normalItems
    const cartNormalItems = normalItems.map((item) => {
      const result = {...item};
      let itemPrice = 0;
      if (item.product?.type === PRODUCT_TYPES.NORMAL) {
        const { price } = CartService.getNormalProductItemPrice(item, normalItemTotalQuantity);
        itemPrice = price;
        result.item_price = price;
      } else {
        itemPrice = item.item_price;
      }

      result.subtotal = item.quantity * itemPrice;
      result.subtotal_retail_price = item.quantity * item.item_retail_price;
      return result;
    });

    const cartFoodItems = foodItems.map((item) => {
      item.subtotal = item.quantity * item.item_price;
      item.subtotal_retail_price = item.quantity * item.item_retail_price;
      return item;
    });

    cart.cart_items = [...cartNormalItems, ...cartFoodItems];

    // Calculate shipping fee for cart
    // Calculate shipping fee for normal items
    const normalItemsByMerchant = groupByFunc(normalItems, "product.merchant_id");
    const normalShopShippingPrice = Object.values(normalItemsByMerchant)
      .map(items => {
        // Calculate total weight of all items by merchants
        return CartService.getNormalItemShippingFeeByMerchantBasedOnDeliveryService(items);
      })
      .reduce((prev, curr) => prev + curr, 0);

    // End calculate shipping fee for normal items

    // Calculate shipping fee for food merchant
    let foodShopShippingFee = 0;
    // If receiver address null, update it with cart address
    if (!receiverAddress) {
      receiverAddress = cart.address;
    }

    // Validate receiver address
    const addressValidation = CartService.addressValidate(receiverAddress);
    const { validated, err } = addressValidation;
    if (!validated) {
      await db.models.carts.update({
        address_id: null
      }, {
        where: clause
      });
      cart.address = null;
      receiverAddress = null;
    }
    
    if (receiver && receiverAddress && foodItems.length)  {
      const itemsByMerchant = groupByFunc(foodItems, 'product.merchant_id');
      foodShopShippingFee = await CartService.calculateFoodShippingFee({
        items: itemsByMerchant,
        receiver,
        receiverAddress,
      });
    }
    cart.total_shipping_price = normalShopShippingPrice + foodShopShippingFee;
    // End calculating shipping fee

    cart.total_items = cart.cart_items
      .map(item => item.quantity)
      .reduce((prev, curr) => prev + curr, 0);

    cart.total_retail_price = cart.cart_items
      .map(item => item.subtotal_retail_price)
      .reduce((prev, curr) => prev + curr, 0);

    cart.total = cart.cart_items
      .map(item => item.subtotal)
      .reduce((prev, curr) => prev + curr, 0);
  } else {
    cart.total_items = 0;
    cart.total = 0;
  }
  let discount = 0;
  if (cart.voucher) {
    if (cart.voucher.category_id) {
      const categoryTotal = cart.cart_items.filter(item => item.product.category_id === cart.voucher.category_id)
        .map(item => item.quantity * item.item_price)
        .reduce((prev, curr) => prev + curr, 0);
      discount = cart.voucher.type === 0 ? categoryTotal * cart.voucher.amount / 100 : cart.voucher.amount;
    } else if (cart.voucher.brand_id) {
      const brandTotal = cart.cart_items.filter(item => item.product.brand_id === cart.voucher.brand_id)
        .map(item => item.quantity * item.item_price)
        .reduce((prev, curr) => prev + curr, 0);
      discount = cart.voucher.type === 0 ? brandTotal * cart.voucher.amount / 100 : cart.voucher.amount;
    } else if (cart.voucher.product_id) {
      const productTotal = cart.cart_items.filter(item => item.product_id === cart.voucher.product_id)
        .map(item => item.quantity * item.item_price)
        .reduce((prev, curr) => prev + curr, 0);
      discount = cart.voucher.type === 0 ? productTotal * cart.voucher.amount / 100 : cart.voucher.amount;
    } else {
      discount = cart.voucher.type === 0 ? cart.total * cart.voucher.amount / 100 : cart.voucher.amount;
    }
    // Check if discount amount is bigger than total without ship
    if (cart.total - discount < 0) {
      discount = cart.total;
    }
    discount = parseFloat(discount.toFixed(2));
    cart.voucher_discount = parseFloat(discount.toFixed(2));
    cart.grand_total = parseFloat(Math.max(cart.total - discount + cart.total_shipping_price, 0).toFixed(2));
  } else {
    cart.voucher_id = 0;
    cart.voucher_discount = parseFloat(0);
    cart.grand_total = parseFloat((cart.total + cart.total_shipping_price).toFixed(2));
  }
  
  if (use_point) {
    let totalAfterDiscount = cart.total - discount;
    cart.used_point = Math.min(totalAfterDiscount * 1000, point)
    cart.point_discount = cart.used_point / 1000
    cart.grand_total = Math.max(parseFloat((cart.grand_total - cart.point_discount).toFixed(2)), 0)
  }
  
  // Parsing and change order_items format
  const tempOrderItems = groupByFunc(cart.cart_items, 'product.merchant_id')
  const cart_items = [];
  for(const tempIndex in tempOrderItems) {
    const temp = tempOrderItems[tempIndex]
    const merchant = temp[0].product.merchants;
    cart_items.push({
      cart_items_data: temp,
      merchant: merchant
    })
  }
  cart.cart_items = cart_items;
  
  return cart;
}

class CartHandler {
  async clearCart(req, res){
    try {
      const validator = await CartValidator.validateGetCart(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;

      let clause = req.user ? {user_id: req.user.id} : {session_id: formData.session_id};

      let cart = await db.models.carts
        .findOne({
          where: clause
        });

      if(cart){
        await db.models.cart_items
          .destroy({
            where: {
              cart_id: cart.id
            }
          });
      }

      cart = await getAndCalculateCart(clause, false, req.user);

      return BaseResponse.Success(res, 'Cart successfully cleared', {
        cart: cart,
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getCart(req, res) {
    try {
      const validator = await CartValidator.validateGetCart(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const formData = validator.data;
    
      const use_point = formData.use_point == "true";

      let clause = req.user ? {user_id: req.user.id} : {session_id: formData.session_id};

      const check = await db.models.carts
        .count({
          where: clause
        })

      let cart;

      if (!check) {
        cart = await db.models.carts
          .create({
            ...clause,
            status: 1,
            cart_items: []
          })
      } else {
        cart = await getAndCalculateCart(clause, use_point, req.user);
      }

      return BaseResponse.Success(res, 'Cart successfully retrieved', {
        cart: cart,
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async addProductToCart(req, res) {
    let transaction = null;
    try {
      const validator = await CartValidator.validateAddToCart(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const phoneValidate = validatePhoneNumber(req.user.contact_no);
      if (!phoneValidate.success) {
        return BaseResponse.BadResponse(res, phoneValidate.message || 'Something went wrong. Please try again later');
      }
  
      const use_point = req.query.use_point == "true"

      const formData = validator.data;
      let clause = req.user ? {user_id: req.user.id} : {session_id: formData.session_id};
      let cart = await db.models.carts
        .findOne({
          where: clause,
          include: [
            {
              model: db.models.cart_items,
              as: 'cart_items'
            },
            {
              model: db.models.vouchers,
              as: 'voucher',
            }
          ]
        });

      if(!cart){
        cart = await db.models.carts
          .create({
            ...clause,
            status: 1,
            cart_items: []
          }, {
            include: [
              {
                model: db.models.cart_items,
                as: 'cart_items'
              }
            ]
          })
      }

      const product = await db.models.products
        .findOne({
          where: {
            id: formData.product_id
          },
          include: ['delivery']
        });

      const cartItem = cart.cart_items.find(item => item.product_id === formData.product_id && item.variant == formData.variant);

      let price = 0;
      let retail_price = 0;
      if (formData.variant) {
        for (const variant of product.variant) {
          for (const value of variant.value){
            if (formData.variant === value.name) {
              if (formData.quantity > value.quantity) return BaseResponse.BadResponse(res, 'Product quantity is not enough');
              price = value.sale_price;
              retail_price = value.retail_price;
              break;
            }
          }
        }
      } else {
        if (formData.quantity > product.available_qty) return BaseResponse.BadResponse(res, 'Product quantity is not enough');
        price = product.sell_price;
        retail_price = product.retail_price;
      }

      transaction = await db.transaction();

      if (!cartItem) {
        let shippingFee = 0;
        // if (product.type === PRODUCT_TYPES.NORMAL) {
        //   const productVariant = product.variant[0]?.value.find(item => item.name === formData.variant) ?? null;
        //   if (productVariant) {
        //     // shippingFee = DeliveryService.calculateShippingFee(productVariant);
        //     shippingFee = CartService.getNormalItemShippingFeeByDeliveryService({
        //       variant: formData.variant, product: {variant: product.variant}
        //     });
        //   }
        // }
        await db.models.cart_items
          .create(
            {
              cart_id: cart.id,
              product_id: formData.product_id,
              quantity: formData.quantity,
              variant: formData.variant ?? null,
              item_price: price,
              item_retail_price: retail_price,
              // shipping_price: (shippingFee * formData.quantity) || product.delivery.fee,
              shipping_price: product.delivery.fee,
              event_id: formData.event_id,
            },
            {
              transaction
            },
          );
      } else {
        let shippingFee = 0;
        // if (product.type === PRODUCT_TYPES.NORMAL) {
        //   const productVariant = product.variant[0]?.value.find(item => item.name === formData.variant) ?? null;
        //   if (productVariant) {
        //     // shippingFee = DeliveryService.calculateShippingFee(productVariant);
        //     shippingFee = CartService.getNormalItemShippingFeeByDeliveryService({
        //       variant: formData.variant, product: {variant: product.variant}
        //     });
        //   }
        // }
        cartItem.quantity = formData.is_update ? formData.quantity : formData.quantity + cartItem.quantity;
        // cartItem.shipping_price = shippingFee * cartItem.quantity;
        await cartItem.save({transaction});
      }

      await transaction.commit();
      transaction = null;

      // Validate total with voucher if cart has voucher
      if (cart.voucher) {
        const voucher = cart.voucher;
        const cartItems = await db.models.cart_items.findAll({
          where: {
            cart_id: cart.id,
          }
        });

        let voucherConditionTotal = 0;

        if (cartItems && cartItems.length) {
          cartItems.forEach((item) => {
            voucherConditionTotal += item.quantity * item.item_price;
          });
        }

        if (voucher.minimum_purchase > 0 && voucherConditionTotal < voucher.minimum_purchase) {
          await cart.update({
            voucher_id: null
          });
        }
      }

      cart = await getAndCalculateCart(clause, use_point, req.user);

      return BaseResponse.Success(res, 'Product added to cart', {cart});
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      console.log('add Cart err: ', err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async removeProductFromCart(req, res) {
    let transaction = null;
    try {
      const validator = await CartValidator.validateRemoveProductFromCart(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const phoneValidate = validatePhoneNumber(req.user.contact_no);
      if (!phoneValidate.success) {
        return BaseResponse.BadResponse(res, phoneValidate.message || 'Something went wrong. Please try again later');
      }

      const formData = validator.data;
    
      const use_point = req.query.use_point == "true"

      let clause = req.user ? {user_id: req.user.id} : {session_id: formData.session_id};
      let cart = await db.models.carts
        .findOne({
          where: clause,
          include: [
            {
              model: db.models.cart_items,
              as: 'cart_items'
            },
            {
              model: db.models.vouchers,
              as: 'voucher',
            }
          ]
        });

      transaction = await db.transaction();

      await db.models.cart_items.destroy({
        where: {
          cart_id: cart.id,
          product_id: formData.product_id,
          variant: formData.variant ?? null,
        },
        transaction,
      })

      await transaction.commit();
      transaction = null;

      // Validate total with voucher if cart has voucher
      if (cart.voucher) {
        const voucher = cart.voucher;
        const cartItems = await db.models.cart_items.findAll({
          where: {
            cart_id: cart.id,
          }
        });

        let voucherConditionTotal = 0;

        if (cartItems && cartItems.length) {
          cartItems.forEach((item) => {
            voucherConditionTotal += item.quantity * item.item_price;
          });
        }

        if (voucher.minimum_purchase > 0 && voucherConditionTotal < voucher.minimum_purchase) {
          await cart.update({
            voucher_id: null
          });
        }
      }

      cart = await getAndCalculateCart(clause, use_point, req.user);

      return BaseResponse.Success(res, 'Product successfully removed from cart', {cart});
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async applyVoucher(req, res) {
    let transaction = null;
    try {
      const validator = await CartValidator.validateApplyVoucher(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const phoneValidate = validatePhoneNumber(req.user.contact_no);
      if (!phoneValidate.success) {
        return BaseResponse.BadResponse(res, phoneValidate.message || 'Something went wrong. Please try again later');
      }
      
      const use_point = req.query.use_point == "true"

      const formData = validator.data;

      const userVoucher = await db.models.user_vouchers
        .findOne({
          where: {
            voucher_id: formData.voucher_id,
            user_id: req.user.id,
            id: formData.user_voucher_id,
          },
          include: [{
            model: db.models.vouchers,
            as: 'voucher',
            include: ['brand', 'category', 'product']
          }]
        })

      if (!userVoucher || userVoucher.amount === 0 || !userVoucher.voucher.status) return BaseResponse.BadResponse(res, 'Voucher does not exist');

      let cart = await db.models.carts
        .findOne({
          where: {
            user_id: req.user.id
          },
          include: [
            {
              model: db.models.cart_items,
              as: 'cart_items',
              include: ['product']
            }
          ]
        })

      let voucherConditionTotal = 0;

      if (cart.cart_items && cart.cart_items.length > 0) {
        cart.cart_items = cart.cart_items.map((item) => {
          item.subtotal = item.quantity * item.item_price + item.shipping_price;
          voucherConditionTotal += item.quantity * item.item_price;
          return item;
        })
        cart.total_items = cart.cart_items.length;
        cart.total = cart.cart_items
          .map(item => item.subtotal)
          .reduce((prev, curr) => prev + curr, 0)
      } else {
        cart.total_items = 0;
        cart.total = 0;
      }

      if (userVoucher.voucher.minimum_purchase > 0 && voucherConditionTotal < userVoucher.voucher.minimum_purchase) return BaseResponse.BadResponse(res, 'Voucher is less than minimum purchase');

      // Check if voucher is available
      const appliedVoucher = userVoucher.voucher;
      if (appliedVoucher) {
        const { start_date, end_date, used_count, quantity } = appliedVoucher;
        if (start_date && end_date) {
          const now = moment();
          if (now.isBefore(start_date) || now.isAfter(end_date)) {
            return BaseResponse.BadResponse(res, 'Voucher does not meet the condition. Please check again.');
          }
        }

        // Commented because we deciced that if user has voucher, user can use it.
        // if (used_count && quantity && used_count >= quantity) {
        //   return BaseResponse.BadResponse(res, 'Voucher is not available.')
        // }
      }

      cart.voucher_id = userVoucher.voucher.id;

      transaction = await db.transaction();

      await cart.save({ transaction });
      await transaction.commit();
      transaction = null;

      const appliedCart = await getAndCalculateCart({user_id: req.user.id}, use_point, req.user);

      const { point_discount, voucher_discount, grand_total } = appliedCart;
      if (( +point_discount >= 0 || +voucher_discount >= 0) && +grand_total <= 0) {
        cart.voucher_id = null;
        await cart.save();
        return BaseResponse.BadResponse(res, 'Cannot apply voucher or points greater than grand total.');
      }

      return BaseResponse.Success(res, 'Voucher was successfully applied', {cart: appliedCart});
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async removeVoucher(req, res){
    let transaction = null;
    try {
      transaction = await db.transaction();

      await db.models.carts
        .update({
          voucher_id: null
        }, {
          where: {
            user_id: req.user.id
          }
        })

      const phoneValidate = validatePhoneNumber(req.user.contact_no);
      if (!phoneValidate.success) {
        return BaseResponse.BadResponse(res, phoneValidate.message || 'Something went wrong. Please try again later');
      }

      const use_point = req.query.use_point == "true";
      await transaction.commit();
      transaction = null;

      const cart = await getAndCalculateCart({user_id: req.user.id}, use_point, req.user);

      return BaseResponse.Success(res, 'Voucher was successfully removed', {cart});
    } catch(err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async changeAddress(req, res) {
    let transaction = null;
    try {
      const validator = await CartValidator.validateChangeAddress(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });
      const { use_point } = req.query;
      const { user } = req;
      const formData = validator.data;

      const phoneValidate = validatePhoneNumber(req.user.contact_no);
      if (!phoneValidate.success) {
        return BaseResponse.BadResponse(res, phoneValidate.message || 'Something went wrong. Please try again later');
      }

      const address = await db.models.user_addresses
        .findOne({
          where: {
            id: formData.address_id,
          }
        });
      
      if (address.user_id !== user.id) return BaseResponse.BadResponse(res, 'Something went wrong');

      const clause = user ? {user_id: user.id} : {session_id: formData.session_id};

      let cart = await CartService.getCart({
        where: clause,
      });

      transaction = await db.transaction();

      cart.address_id = address.id;
      await cart.save({ transaction });

      await transaction.commit();
      transaction = null;

      cart = await getAndCalculateCart(clause, use_point == 'true', user, address);

      return BaseResponse.Success(res, 'Change address success', { cart });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async updateFoodOrderDeliveryTime(req, res) {
    let transaction = null;
    try {
      const validator = await CartValidator.validateUpdateFoodOrderDeliveryTime(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
        errors: validator.error
      });

      const phoneValidate = validatePhoneNumber(req.user.contact_no);
      if (!phoneValidate.success) {
        return BaseResponse.BadResponse(res, phoneValidate.message || 'Something went wrong. Please try again later');
      }
    
      const formData = validator.data;
      
      const use_point = req.query.use_point == "true";
      
      const cartItem = await db.models.cart_items.findOne({
        where: {
          id: formData.cart_item_id
        },
        include: ['product', 'cart']
      });
      
      if(cartItem.cart.user_id !== req.user.id) {
        return BaseResponse.Forbidden(res)
      }
      
      const cartItemIds = await db.models.cart_items.findAll({
        where: {
          cart_id: cartItem.cart_id,
          '$product.merchant_id$': cartItem.product.merchant_id
        },
        include: ['product']
      }).then(rows => rows.map(row => row.id));

      transaction = await db.transaction();
    
      await db.models.cart_items.update({
        note: JSON.stringify({
          delivery_time: moment(formData.time).format('YYYY-MM-DD HH:mm')
        })
      }, {
        where: {
          id: {
            [Op.in]: cartItemIds
          }
        },
        transaction,
      });

      await transaction.commit();
      transaction = null;

      const cart = await getAndCalculateCart({user_id: req.user.id}, use_point, req.user);
    
      return BaseResponse.Success(res, 'Change delivery time success', {
        cart,
      });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new CartHandler;
