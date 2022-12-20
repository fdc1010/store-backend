const {Op} = require('sequelize');

const db = require("../configs/sequelize");
const  { MERCHANT_TYPE, DELIVERY_TYPE, EVENT_TYPES } = require('../configs');
const DeliveryService = require('./lalamove.service'); // lalamove service
const NormalDeliveryService = require('./delivery.service');
const EventsService = require('./events.service');
const moment = require('../configs/moment');

class CartService {
  constructor() {
    this.Model = db.models.carts;
    this.CartItemModel = db.models.cart_items;
  }

  async getCart({where, ...options}) {
    return this.Model.findOne({
      where,
      ...options
    });
  }

  separateCartItemByFoodAndNormalShops(items) {
    return items.reduce((results, item) => {
      const normalItems = results[0];
      const foodItems = results[1];

      const { product: { merchants: { type } } } = item;
      type === MERCHANT_TYPE.FOOD ? foodItems.push(item) : normalItems.push(item);
      return [[...normalItems], [...foodItems]];
    }, [[], []]);
  }

  async getFoodShopShippingFee({ shop, destination, serviceType = DELIVERY_TYPE.MOTORCYCLE }) {
    const quotationBody = DeliveryService.prepareQuationBody({
      shop,
      destination,
      serviceType,
    });

    const {success, quotation, message} = await DeliveryService.getQuotation({data: quotationBody});

    if (!success) {
      throw new Error(message);
    }

    return {
      quotationBody,
      quotation,
    }
  }

  addressValidate = (address) => {
    try {
      if (!address) {
        return { error: 'Missing address', validated: false };
      }
      const { latitude, longitude } = address;
      if (!latitude || !longitude) {
        return { error: 'Missing lat lng', validated: false };
      }

      return { error: null, validated: true, }
    } catch (err) {
      console.log('validate address err: ', err);
    }
  }

  async calculateFoodShippingFee({
    items,
    receiver,
    receiverAddress,
  }) {
    let foodShopShippingFee = 0;
    for ( const index in items) {
      const foodItems = items[index];
      const foodItemIds = foodItems.map(item => item.id);
      const merchant = foodItems[0].product.merchants;
      const shop = {
        address: {
          location: {
            lat: merchant.latitude.toString(),
            lng: merchant.longitude.toString(),
          },
          addresses: merchant.office_address,
        },
        contact: {
          name: merchant.name || merchant.user?.name,
          phone: DeliveryService.parseQuotationPhone(merchant.office_phone_number || merchant.user?.contact_no),
        }
      }
      const destination = {
        contact: {
            name: receiver.name,
            phone: DeliveryService.parseQuotationPhone(receiver.contact_no),
        },
        address: {
          location: {
            lat: receiverAddress.latitude.toString(),
            lng: receiverAddress.longitude.toString()
          },
          addresses: receiverAddress.full_address,
      }
    }
      const { quotation, quotationBody } = await this.getFoodShopShippingFee({
        shop,
        destination,
      });

      // if (!quotation || !quotation.totalFee) {
      //   return 0;
      // }

      // Update cart item shipping fee with the fee from delivery
      this.CartItemModel.update(
        {
          shipping_price: +(quotation.totalFee),
          lalamove_quotation: JSON.stringify(quotationBody),
        },
        {
          where: {
            id: {
              [Op.in]: foodItemIds,
            },
          },
        },
      );

      foodShopShippingFee += +quotation.totalFee;
    }

    return foodShopShippingFee;
  }

  getNormalProductItemPrice(item, normalItemTotalQuantity) {
    try {
      const { event, item_price, product, } = item;
      const { bundle_deal, id } = product;

      // If bundle price
      // If quantity of items are match the condition for bundle price
      // Use bundle price
      // Else if flash deal, use flash deal
      if (bundle_deal && bundle_deal.length) {
        const quantity = normalItemTotalQuantity[id];
        const matchDeal = bundle_deal.find(deal => quantity >= deal.min_quantity && quantity <= deal.max_quantity);
        if (matchDeal) {
          const discountValue = +(item_price * (matchDeal.discount_percent || 100) / 100).toFixed(2);
          // return item_price - discountValue;
          return {
            price: item_price - discountValue,
            flashdeal: null,
          }
        }
      }

      // Get product price by flash deal.
      if(event && event.type === EVENT_TYPES.FLASH_DEAL) {
        const { start_date, end_date } = event;
        const now = moment();
        if (moment(start_date).isSameOrBefore(now) && moment(end_date).isSameOrAfter(now)) {
          const {
            productPrice,
            merchantDiscountValue,
            adminDiscountValue,
            markettingDiscountValue
          } = EventsService.calculateFlashDealPrice(item.item_price, item.event);
          return {
            price: productPrice,
            flashDeal: {
              productPrice,
              merchantDiscountValue,
              adminDiscountValue,
              markettingDiscountValue
            },
          };
        }
      }

      return {
        price: item_price,
        flashDeal: null,
      }
    } catch (err) {
      console.log('get normal product item price err: ', err);
      return {
        price: item.item_price,
        flashDeal: null,
      }
    }
  }

  getNormalItemShippingFeeByMerchant(items) {
    try {
      const itemShppingPrice = items.map(item => +item.shipping_price);
      const fee = itemShppingPrice.length ? Math.max(...itemShppingPrice) : 0;
      return fee;
    } catch (err) {
      console.log('Get normal item shipping fee by merchant error: ', err);
      return 0;
    }
  }


  getNormalItemShippingFeeByDeliveryService({ data, shipping_price }) {
    try {
      // const { product, variant, shipping_price, quantity } = item;
      // const productVariant = product.variant[0]?.value.find(item => item.name === variant) || null;
      // const shippingPrice = NormalDeliveryService.calculateShippingFee(productVariant) || shipping_price;
      const shippingPrice = NormalDeliveryService.calculateShippingFee(data) || shipping_price;
      return shippingPrice;
      // return shippingPrice * quantity;
    } catch (err) {
      console.log('Get normal item shipping fee by delivery error: ', err);
      return 0;
    }
  }

  getNormalItemShippingFeeByMerchantBasedOnDeliveryService(items) {
    try {
      const totalWeight = items.map(item => {
        const { product, variant, quantity, shipping_price } = item;
        const productVariant = product.variant[0]?.value.find(item => item.name === variant) || {};
        const { weight = null } = productVariant;
        
        const itemWeightWithQuantity = weight ? weight * quantity : 1.1 * quantity;
        return itemWeightWithQuantity;
      }).reduce((prev, curr) => prev + curr, 0);

      // Calculte shipping fee based on total weight
      const shippingFee = this.getNormalItemShippingFeeByDeliveryService({
        data: {
          weight: totalWeight,
          shipping_price: 3.4,
        }
      });

      return shippingFee;
    } catch (err) {
      console.log('Get normal item shipping fee by merchatn based on delivery service err: ', err);
      throw err;
    }
  }
}

module.exports = new CartService();
