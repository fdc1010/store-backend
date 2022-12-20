const {Op} = require('sequelize');

const db = require("../configs/sequelize");
const { EVENT_STATUS, EVENT_TYPES, BMART_FEE } = require('../configs');
const moment = require('../configs/moment');
class EventsService {
  constructor() {
    this.Model = db.models.events;
  }

  async findAll({ where = {}, ...options}) {
    return this.Model.findAll({
      where,
      ...options
    });
  }

  async findOne({ where = {}, ...options }) {
    return this.Model.findOne({
      where,
      ...options,
    });
  }

  async create({ data, ...options }) {
    return this.Model.create({ ...data }, {...options});
  }

  async update({ data, ...options }) {
    console.log('data: ', data);
    console.log('options: ', options);
    return this.Model.update({ ...data }, { ...options });
  }

  async validateEvent(event) {
    const { start_date, end_date, id, type } = event;
    const start = moment(start_date).toDate();
    const end = moment(end_date).toDate();
    const exsitedEvent = await this.findOne({
      where: {
        status: EVENT_STATUS.ACTIVE,
        type,
        [Op.or]: [
          // Check if new event contains exsisted start date
          {
            start_date: {
              [Op.gte]: start,
              [Op.lte]: end,
            },
          },
          // Check if new event contains existed end date
          {
            end_date: {
              [Op.gte]: start,
              [Op.lte]: end,
            }
          },
          // Check if new event is inside exsited event
          {
            [Op.and]: [
              {
                start_date: {
                  [Op.lte]: start
                }
              },
              {
                end_date: {
                  [Op.gte]: end,
                }
              },
            ],
          },
        ],
      }
    });

    if (exsitedEvent && +exsitedEvent.id !== +id) {
      return {
        isValid: false,
        error: 'There is an existed event with type and date collapsed.'
      }
    }

    return { isValid: true, error: null };
  }

  calculateFlashDealPrice(price, event) {
    try {
      // const BMartFeeValue = BMART_FEE * price;
      const {
        content: {
          admin_percent = 0,
          merchant_percent = 0,
          marketing_percent = 0,
          marketing_discount_amount = 0,
        }
      } = event;

      // const markettingDiscountValue = +(marketing_percent * price / 100) || 0;
      const markettingDiscountValue = this.calculateFlashDealMarketingDiscount({
        percent: marketing_percent,
        value: marketing_discount_amount,
        price,
      });
      const adminDiscountValue = this.calcualteFlashDealAdminDiscount({
        markettingDiscountValue,
        price,
        admin_percent,
      });
      const merchantDiscountValue = +(merchant_percent * adminDiscountValue / 100) || 0;
      const productPrice = +(price - adminDiscountValue - markettingDiscountValue).toFixed(2);

      return {
        productPrice: productPrice < 0 ? 0 : productPrice,
        merchantDiscountValue,
        adminDiscountValue,
        markettingDiscountValue,
      }
    } catch (err) {
      console.log('Calculate flash deal price err: ', err);
      return {
        productPrice: price,
        merchantDiscountValue: 0,
        adminDiscountValue: 0,
        markettingDiscountValue: 0,
      };
    }
  }

  calculateFlashDealMarketingDiscount({ percent, value, price }) {
    if (percent) {
      return +(percent * price / 100) || 0;
    }

    // If discount value bigger than price
    // Discount value should be the price
    if (value) {
      if (value > price) {
        return price;
      } else {
        return value;
      }
    }

    return 0;
  }

  calcualteFlashDealAdminDiscount({ markettingDiscountValue, price, admin_percent }) {
    // If Marketting disocunt > price
    // Price is 0 and BmartDiscount will be 0
    // Else if BmartDiscount greater than the amount after price sub marketting discount
    // BmartDiscount must be the amount after price sub marketting discount
    // Else BMart disocunt calculate normally
    const BMartFeeValue = BMART_FEE * price;
    let adminDiscountValue = +(admin_percent * BMartFeeValue / 100) || 0;
    if (price - markettingDiscountValue > 0) {
      if ((price - markettingDiscountValue) < adminDiscountValue) {
        adminDiscountValue = price - markettingDiscountValue;
      }
    } else {
      adminDiscountValue = 0;
    }

    return adminDiscountValue;
  }

  async getActiveFlashDeal() {
    const now = moment();
    const where = {
      type: EVENT_TYPES.FLASH_DEAL,
      status: EVENT_STATUS.ACTIVE,
      start_date: {
        [Op.lte]: now.toDate(),
      },
      end_date: {
        [Op.gte]: now.toDate(),
      }
    };

    return this.findOne({
      where,
    });
  }
}

module.exports = new EventsService();
