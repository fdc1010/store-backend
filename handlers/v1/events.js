const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const db = require('../../configs/sequelize');

const { EVENT_STATUS, EVENT_TYPES, EVENT_ITEM_STATUS, EVENT_ITEM_TYPES } = require('../../configs');
const moment = require('../../configs/moment');

const Pagination = require('../../utils/pagination');

const EventsValidator = require('../../validators/events');
const EventsService = require('../../services/events.service');
const EventItemsService = require('../../services/event_items.service');

class EventHandler {
  constructor() {}

  async createEvent(req, res, next) {
    // let transaction = null;
    try {
      const validator = await EventsValidator.validateAdd(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;

      // const { event_items, start_date, end_date, ...eventData } = formData;
      const { start_date, end_date, ...eventData } = formData;

      // transaction = await db.transaction();

      eventData.start_date = moment(start_date);
      eventData.end_date = moment(end_date);

      // Validate event before create it
      const { isValid, error } = await EventsService.validateEvent(eventData);
      if (!isValid) {
        return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
      }

      const createdEvent = await EventsService.create({
        data: eventData,
        // transaction,
      });

      // const eventItems = event_items.map(item => ({ ...item, event_id: createdEvent.id, type: createdEvent.type }));

      // const createdEventItems = await EvenItemsService.bulkCreate(eventItems, {
      //   transaction
      // });

      // await transaction.commit();

      return BaseResponse.Success(res, 'Add event successfully.', {
        data: createdEvent,
      });
    } catch (err) {
      // if (transaction) {
      //   await transaction.rollback();
      // }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getActiveFlashDeal(req, res, next) {
    try {
      const activeFlashDeal = await EventsService.getActiveFlashDeal();

      return BaseResponse.Success(res, 'Get active flash deal successfully.', { data: activeFlashDeal ?? null})
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getEvents(req, res, next) {
    try {
      const { status, type, keyword } = req.query;
      const whereClause = {
        status: { [Op.in]: [EVENT_STATUS.ACTIVE, EVENT_STATUS.DISABLED] },
      }

      if (type) {
        whereClause.type = type;
      }

      if (status) {
        whereClause.status = status;
      }

      if (keyword) {
        whereClause.name = { [Op.like]: keyword };
      }

      return await Pagination.paging(req, res, db.models.events, {where: whereClause} );
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getEventById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const event = await EventsService.findOne({
        where: { id },
        // include: [
        //   {
        //     model: db.models.event_items,
        //     as: 'event_items',
        //     where: {
        //       status: EVENT_ITEM_STATUS.ACTIVE,
        //     },
        //     include: [
        //       {
        //         model: db.models.products,
        //         as: 'product'
        //       }
        //     ]
        //   }
        // ],
      });

      if (!event) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      return BaseResponse.Success(res, 'Get event successfully.', { data: event });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateEvent(req, res, next) {
    // let transaction = null;
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params.');
      }

      const validator = EventsValidator.validateUpate(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          error: validator.error
      });

      const formData = validator.data;
      const { start_date, end_date, ...eventData } = formData;

      eventData.start_date = moment(start_date);
      eventData.end_date = moment(end_date);

      const event = await EventsService.findOne({
        where: {
          id,
        }
      });

      if (!event) {
        return BaseResponse.BadResponse(res, 'Not found.');
      }

      // Validate event before create it
      const { isValid, error } = await EventsService.validateEvent(eventData);
      if (!isValid) {
        return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
      }

      // transaction = await db.transaction();
      
      // const updatedEvent = await event.update({ ...eventData }, { transaction });
      const updatedEvent = await event.update({ ...eventData });

      // const eventItems = event_items.map(item => ({ ...item, event_id: event.id, type: event.type }));
      // const updatedEventItems = await EvenItemsService.bulkCreate(
      //   eventItems,
      //   {
      //     transaction,
      //     updateOnDuplicate: [
      //       'item_id',
      //       'event_id',
      //     ]
      //   }
      // );

      // await transaction.commit();

      const result = await EventsService.findOne({
        where: {
          id: event.id,
        },
        include: ['event_items']
      });

      return BaseResponse.Success(res, 'Update successfully.', {
        data: result
      });
    } catch (err) {
      // if (transaction) {
      //   await transaction.rollback();
      // }
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async removeEvent(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const event = await EventsService.findOne({
        where: { id }
      });

      if (!event) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      event.status = EVENT_STATUS.REMOVED;
      await event.save();

      return BaseResponse.Success(res, 'Remove success');
    } catch (err) {

    }
  }

  async getEventItems(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const event = await EventsService.findOne({
        where: {
          id,
        }
      });

      if (!event) {
        return BaseResponse.BadResponse(res, 'Not found event');
      }

      const { type } = event;

      const whereClause = {
        event_id: id,
        status: EVENT_ITEM_STATUS.ACTIVE,
      }

      let relationModel = db.models.products;

      // TODO: Update relation model based on event type

      const include = [
        {
          model: relationModel,
          as: 'product',
          include: [{
            model: db.models.product_assets,
            as: 'product_assets',
            attributes: ['id', 'url', 'description', 'is_image', 'status']
          }]
        }
    ];

      return await Pagination.paging(req, res, db.models.event_items, {where: whereClause}, include );
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new EventHandler();
