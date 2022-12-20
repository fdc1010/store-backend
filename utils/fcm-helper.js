const fcm = require('../configs/fcm');
const db = require('../configs/sequelize');

class FcmHelper {
  
    async addUserFcm(user_id,fcm_token, fcm_topics = 1){
      try{
        return await db.models.user_fcms.findOne({
            where: {
                user_id: user_id
            }
          })
          .then(async(user_fcm) => {
            if(fcm_token){
              if(user_fcm){ 
                  return await db.models.user_fcms.update({
                      fcm_token: fcm_token
                    }, {
                      where: {
                          user_id: user_id
                      }
                    });
              }else{
                  return await db.models.user_fcms.create({
                      user_id: user_id,
                      fcm_token: fcm_token,
                      fcm_topics: fcm_topics
                    });
              }
            }
            return null;
          })
          .catch(err => {
            return null;
          })
        }catch(err){
           console.log("Error in adding user fcm token: ",err.message);
        }
        return null
    };

    async pushNotification(userFcmToken, title, description, model){

        // const message = {
        //                     notification: {
        //                         title: title,
        //                         body: description
        //                     },
        //                     token: userFcmToken
        //                 };

        const message = {
          notification: {
            title: title,
            body: description
          },
          data: model,
          token: userFcmToken
        };
        console.log("notif message: ",message);
        return fcm.messaging().send(message)
                        .then(info => {                            
                            // console.log('Successfully sent message:', info);
                            return true;
                        })
                        .catch(err => {
                            console.log('Error sending message:', err);
                            return false;
                        });
    }
  
    async pushNotificationById(userFcmToken, title, description, order = { order_id: '0'}){

        // const message = {
        //                     notification: {
        //                         title: title,
        //                         body: description
        //                     },
        //                     token: userFcmToken
        //                 };

        const message = {
          notification: {
            title: title,
            body: description
          },
          data: order,
          token: userFcmToken
        };
        console.log("notif message: ",message);
        return fcm.messaging().send(message)
                        .then(info => {                            
                            // console.log('Successfully sent message:', info);
                            return true;
                        })
                        .catch(err => {
                            console.log('Error sending message:', err);
                            return false;
                        });
    }

    prepareImagePayload(imageUrl) {
      return {
        android: {
          notification: {
            image: imageUrl,
          }
        },
        apns: {
          payload: {
            aps: {
              'mutable-content': 1
            }
          },

          fcm_options: {
            image: imageUrl,
          }
        },
        webpush: {
          headers: {
            image: imageUrl,
          }
        },
      }
    }

    async pushNotificationToMultipleDevices({ userFcmTokens = [], title, description, data = {} }) {
      try {
        let message = {
          notification: {
            title: title,
            body: description,
          },
          tokens: userFcmTokens,
        };

        if (data) {
          const { imageUrl, ...notiData } = data;
          message.data = notiData;

          if (imageUrl) {
            message = {
              ...message,
              ...this.prepareImagePayload(imageUrl),
            }
          }
        }

        return fcm.messaging().sendMulticast(message)
            .then(info => {
              console.log('Successfully sent message multiple:', info);
              return true;
            })
            .catch(err => {
              console.log('Error sending message:', err);
              return false;
            });
      } catch (err) {
        console.log('push notification to multiple device err: ', err);
      }
    }
  }
  
  module.exports = new FcmHelper;
