"use strict";
const db = require('../../configs/sequelize');
const PushNotificationValidator = require('../../validators/push-notifications');
const FcmHelper = require('../../utils/fcm-helper');

class PushNotificationHandler {

    async getPushNotification(req, res) {
        const user_id = req.user.id;

        await db.models.push_notifications
                .findOne({ where: {user_id} })
                .then(async (push_notification) => {
                    if (!push_notification) {
                        push_notification = await db.models.push_notifications.create({ user_id });
                    }
                    return BaseResponse.Success(res, 'Push Notification Data Found', { data: push_notification });
                })
                .catch(err =>{ return BaseResponse.BadResponse(res, err.message); })
    }

    async updatePushNotification(req, res) {
        const user_id = req.user.id;

        const validator = PushNotificationValidator.validateUpdatePushNotification(req);
        if (!validator.success) return BaseResponse.UnprocessableEntity(res, validator.message, {
            errors: validator.error
        });

        const formData = validator.data;
        await db.models.push_notifications.update({ ...formData }, {
            where: {
                user_id: user_id
            }
        })

        return BaseResponse.Success(res, 'Push Notification successfully updated');
    }

    async sendPushNotification(user_id = NULL, title = "Push Notification", description = "Sending a test Push Notification", model = null){
        try{
            const userFcmToken = await db.models.user_fcms.findOne({
                where: {
                    user_id: user_id
                }
            });

            if(!userFcmToken) return false;

            return await FcmHelper.pushNotification(userFcmToken.fcm_token,title,description, model)
                                .then(info => { 
                                    console.log("sendPushNotification info",info);
                                    return true;
                                })
                                .catch(err => { 
                                    console.log("sendPushNotification err",err.message);
                                    return false;
                                });
        }catch(err){
            console.log("pushNotification err",err.message);
            return false;
        }
    }
    async sendPushNotificationById(user_id = NULL, title = "Push Notification", description = "Sending a test Push Notification", orderId){
        try{
            const userFcmToken = await db.models.user_fcms.findOne({
                where: {
                    user_id: user_id
                }
            });

            if(!userFcmToken) return false;

            return await FcmHelper.pushNotificationById(userFcmToken.fcm_token,title,description, { order_id: `${orderId}` })
                                .then(info => { 
                                    console.log("sendPushNotification info",info);
                                    return true;
                                })
                                .catch(err => { 
                                    console.log("sendPushNotification err",err.message);
                                    return false;
                                });
        }catch(err){
            console.log("pushNotification err",err.message);
            return false;
        }
    }
}

module.exports = new PushNotificationHandler;