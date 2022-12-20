const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const db = require('../../configs/sequelize');

const { EVENT_ITEM_STATUS } = require('../../configs');
const moment = require('../../configs/moment');

const Pagination = require('../../utils/pagination');

const EventItemsValidator = require('../../validators/event-items-validator');
const EventsService = require('../../services/events.service');
const EventItemsService = require('../../services/event_items.service');


class EventItemHandler {
  constructor() {}

  async createEventItem(req, res, next) {
    try {
      const validator = await EventItemsValidator.validateAdd(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      const { event_id } = formData;
      const selectedEvent = await EventsService.findOne({
        where: { id: event_id }
      });

      if (!selectedEvent) {
        return BaseResponse.BadResponse(res, 'Not found event');
      }

      const { start_date, end_date, id } = selectedEvent;

      // Validate event item before create it
      const { isValid, error } = await EventItemsService.validateEventItem(formData, start_date, end_date);
      if (!isValid) {
        return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
      }

      const created = await EventItemsService.create({ data: formData });

      return BaseResponse.Success(res, 'Add event item successfully.', {
        data: created,
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateEventItem(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const validator = await EventItemsValidator.validateUpate(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      const { event_id } = formData;
      const selectedEvent = await EventsService.findOne({
        where: { id: event_id }
      });

      if (!selectedEvent) {
        return BaseResponse.BadResponse(res, 'Not found event');
      }

      const { start_date, end_date } = selectedEvent;

      const eventItem = await EventItemsService.findOne({
        where: { id }
      });

      if (!eventItem) {
        return BaseResponse.BadResponse(res, 'Not found.');
      }

      // Validate event item before create it
      const { isValid, error } = await EventItemsService.validateEventItem(formData, start_date, end_date);
      if (!isValid) {
        return BaseResponse.BadRequest(res, error ?? 'Something went wrong. Please try again later.');
      }

      // const created = await EventItemsService.create({ data: formData });
      const updatedEvent = await eventItem.update({ ...formData });

      return BaseResponse.Success(res, 'Add event item successfully.', {
        data: updatedEvent,
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async removeEventItem(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing params');
      }

      const eventItem = await EventItemsService.findOne({
        where: { id }
      });

      if (!eventItem) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      eventItem.status = EVENT_ITEM_STATUS.REMOVED;
      await eventItem.save();

      return BaseResponse.Success(res, 'Remove success');
    } catch (err) {

    }
  }
}

module.exports = new EventItemHandler();
