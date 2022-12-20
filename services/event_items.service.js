const {Op} = require('sequelize');

const db = require("../configs/sequelize");
const moment = require('../configs/moment');
const { EVENT_STATUS, EVENT_ITEM_STATUS, EVENT_TYPES, EVENT_ITEM_TYPES, PRODUCT_TYPES, MERCHANT_TYPE } = require('../configs');

const ProductService = require('./products.service');
class EventItemsService {
  constructor() {
    this.Model = db.models.event_items;
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
    return this.Model.update({ ...data }, { ...options });
  }

  async bulkCreate(data, options = {}) {
    return this.Model.bulkCreate(data, {...options});
  }

  async validateEventItem(data, start_date, end_date) {
    const start = moment(start_date).startOf('d').toDate();
    const end = moment(end_date).endOf('d').toDate();

    const { item_id, id, event_id, type } = data;

    const existed = await this.findOne({
      where: {
        item_id,
        status: EVENT_ITEM_STATUS.ACTIVE,
        [Op.or]: [
          // Check if item has been in event
          {
            event_id,
          },
          // Check if new event contains exsisted start date
          {
            '$event.start_date$': {
              [Op.gte]: start,
              [Op.lte]: end,
            },
            '$event.status$': EVENT_STATUS.ACTIVE,
          },
          // Check if new event contains existed end date
          {
            '$event.end_date$': {
              [Op.gte]: start,
              [Op.lte]: end,
            },
            '$event.status$': EVENT_STATUS.ACTIVE,
          },
          // Check if new event is inside exsited event
          {
            [Op.and]: [
              {
                '$event.start_date$': {
                  [Op.lte]: start
                }
              },
              {
                '$event.end_date$': {
                  [Op.gte]: end,
                }
              },
            ],
            '$event.status$': EVENT_STATUS.ACTIVE,
          },
        ],
      },
      include: [
        {
          model: db.models.events,
          as: 'event',
        }
      ]
    });

    if (existed && +existed.id !== +id) {
      return {
        isValid: false,
        error: 'This item has been in another event.'
      }
    }

    if (type === EVENT_ITEM_TYPES.PRODUCT_FLASH_DEAL) {
      const product = await ProductService.findOne({
        where: {id : item_id },
        include: [
          {
            model: db.models.merchants,
            as: 'merchants',
            attributes: ['type', 'name', 'id'],
          }
        ],
      });

      if (!product) {
        return {
          isValid: false,
          error: 'This item not found.'
        }
      }

      const { status, type } = product;
      if (status !== 2 || type !== PRODUCT_TYPES.NORMAL ) {
        return {
          isValid: false,
          error: 'This item is not product for sale.'
        }
      }

      const { merchants = {} } = product;
      if (!merchants || !merchants.type || merchants.type !== MERCHANT_TYPE.NORMAL) {
        return {
          isValid: false,
          error: 'This item is not product for sale.'
        }
      }
    }

    return { isValid: true, error: null };
  }
}

module.exports = new EventItemsService();
