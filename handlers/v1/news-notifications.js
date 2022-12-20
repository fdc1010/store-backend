"use strict";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const UUID = require('uuid');
const gcs = require('../../configs/gcs');

const StrHelper = require('../../utils/str');
const db = require('../../configs/sequelize');

const { NEWS_NOTIFICATION_STATUS, NEWS_NOTIFICATION_TYPES } = require('../../configs');

const NewsNotificationValidator = require('../../validators/news-notifications');
const NewsNotificationService = require('../../services/news-notifications');

const Pagination = require('../../utils/pagination');

class NewsNotificationsHandler {
  async getNewsNotifications(req, res, next) {
    try {
      const { status, type } = req.query;
      let whereClause = {
        status: NEWS_NOTIFICATION_STATUS.ACTIVE,
      };
      if (status) {
        whereClause.status = status;
      }

      if (type) {
        whereClause.type = type;
      }

      return await Pagination.paging(req, res, db.models.news_notifications, {where: whereClause} );
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async createNewsNotification(req, res, next) {
    try {
      const validator = await NewsNotificationValidator.validateAdd(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;
      const newsNotification = await NewsNotificationService.create({
        data: { ...formData }
      });

      return BaseResponse.Success(res, 'Popup Setting Successfully Created', {
        data: newsNotification
      });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getNewsNotification(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing required params');
      }

      const result = await NewsNotificationService.findOne({
        where: {
          id,
        }
      });

      return BaseResponse.Success(res, 'Get news notification.', { data: result });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async updateNewsNotification(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing required params.');
      }

      const validator = await NewsNotificationValidator.validateUpdate(req);
      if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
          errors: validator.error
      });

      const formData = validator.data;

      const noti = await NewsNotificationService.findOne({
        where: {
          id
        }
      });

      if (!noti) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      const updated = await noti.update({
        ...formData,
      });

      return BaseResponse.Success(res, 'Update success.', { data: updated });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async removeNewsNotification(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return BaseResponse.BadResponse(res, 'Missing required params.');
      }

      const noti = await NewsNotificationService.findOne({
        where: {
          id,
        }
      });

      if (!noti) {
        return BaseResponse.BadResponse(res, 'Not found');
      }

      noti.status = NEWS_NOTIFICATION_STATUS.REMOVED;
      await noti.save();

      return BaseResponse.Success(res, 'Remove notification success.', { data: noti });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new NewsNotificationsHandler();

