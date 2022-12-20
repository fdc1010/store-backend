"use strict";
const db = require('../../configs/sequelize');
const EmailNotificationValidator = require('../../validators/email-notifications');
const EmailHelper = require('../../utils/email-helper');

class EmailNotificationHandler {

    async getEmailNotification(req, res) {
        const user_id = req.user.id;

        await db.models.email_notifications
                .findOne({ where: {user_id} })
                .then(async (email_notification) => {
                    if (!email_notification) {
                        email_notification = await db.models.email_notifications.create({ user_id });
                    }
                    return BaseResponse.Success(res, 'Email Notification Data Found', { data: email_notification });
                })
                .catch(err => BaseResponse.BadResponse(res, err.message))
    }

    async updateEmailNotification(req, res) {
        const user_id = req.user.id;

        const validator = EmailNotificationValidator.validateUpdateEmailNotification(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        await db.models.email_notifications.update({ ...formData }, {
            where: {
                user_id: user_id
            }
        })

        return BaseResponse.Success(res, 'Email Notification successfully updated');
    }
    
    /**
     *
     * @param user
     * @param template
     * @param email_subject
     * @param email_description
     * @param user_name
     * @param user_email
     * @param email_from
     * @returns {Promise<boolean>}
     */
    async sendEmailNotificationWithTemplate(user, template = {}, email_subject = null, email_description = null, user_name = null, user_email = null, email_from = null) {
        const locals = {
            name: (user_name ? user_name : user.name),
            from: (email_from ? email_from : 'Store Backend - Info <admin@store.backend.fdc>'),
            email: (user_email ? user_email : user.email),
            subject: (email_subject ? email_subject : 'Email Notification'),
            data: template.data
        };
        
        return await EmailHelper.sendMailFromTemplate(template.id, locals)
          .then(info => {
              console.log("sendEmailNotification info", info);
              return true;
          })
          .catch(err => {
              console.log(err.response.body)
              console.log("sendEmailNotification err", err.message);
              return false;
          });
    }
    
    async sendEmailNotification(user, email_notif_index = 0, email_subject = null, email_description = null, user_name = null, user_email = null, email_from = null) {
        
        const template = [
            'email-notification-none',
            'email-notification-likes',
            'email-notification-chats',
            'email-notification-promo',
            'email-notification-newsletter',
            'email-notification-orders-placed',
            'email-notification-orders-paid',
            'email-notification-new-orders-for-merchant',
            'email-notification-orders-received',
            'email-notification-orders-payment-failed',
            'email-notification-user-points',
            'email-notification-user-spinwheel'
        ];
        console.log('template used :', template[email_notif_index])
        const locals = {
            name: (user_name ? user_name : user.name),
            from: (email_from ? email_from : 'Store Backend - Info <admin@store.backend.fdc>'),
            email: (user_email ? user_email : user.email),
            subject: (email_subject ? email_subject : 'Email Notification'),
            description: (email_description ? email_description : ''),
            template: template[email_notif_index]
        };
        
        return await EmailHelper.sendMail(locals)
          .then(info => {
              console.log("sendEmailNotification info", info);
              return true;
          })
          .catch(err => {
              console.log("sendEmailNotification err", err.message);
              return false;
          });
    }
}

module.exports = new EmailNotificationHandler;
