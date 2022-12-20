"use strict";

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../configs/sequelize');
const EmailNotificationHandler = require('./email-notifications');
const PushNotificationHandler = require('./push-notifications');
const Pagination = require('../../utils/pagination');
const moment = require("moment");
const StrHelper = require('../../utils/str');
const FcmHelper = require('../../utils/fcm-helper');

const isREAD = {UNREAD: 0, READ: 1};
const NOTIFICATION = {STATUS_INACTIVE: 0, STATUS_ACTIVE: 1};
const TYPE = {
  NONE: 0,
  PRODUCT_LIKE: 1,
  CHAT: 2,
  PROMOTION: 3,
  NEWSLETTER: 4,
  ORDER_PLACED: 5,
  ORDER_PAID: 6,
  ORDER_RECEIVED: 7,
  PAYMENT_FAILED: 8,
  USER_POINTS: 9,
  USER_PRIZES: 10,
  USER_SPINWHEEL: 11
};
const TYPE_LABEL = ['', 'likes', 'order', 'chat', 'promo', 'newsletter'];

class NotificationHandler {
  
  async getAllNotification(req, res) {
    
    let clause = {};
    clause.where = {};
    
    if (req.query.keyword) clause.where.description = {[Op.like]: "%" + req.query.keyword + "%"};
    if (req.query.status && !isNaN(req.query.status)) clause.where.status = parseInt(req.query.status);
    if (req.query.is_read && !isNaN(req.query.is_read)) clause.where.is_read = parseInt(req.query.is_read);
    
    clause.where.user_id = req.query.user_id && !isNaN(req.query.user_id) ? {[Op.in]: [parseInt(req.query.user_id), req.user.id]} : req.user.id;
    
    const {type} = req.query;

    if (type && (type === 'merchant' || type === 'admin')) {
      const { where } = clause;
      const { user_id, ...rest } = where;
      const targetUserId = req.query.user_id && !isNaN(req.query.user_id) ? {[Op.in]: [parseInt(req.query.user_id), req.user.id]} : req.user.id;
      const query = type === 'merchant' ? {[Op.or]: [
        // {
        //   user_id,
        // },
        {
          target_user_id: targetUserId,
        }
      ]} : {};

      clause.where = {
        ...rest,
        ...query,
      }
    } else {
      clause.where.type = { [Op.ne]: TYPE.PRODUCT_LIKE };
    }

    // clause.attributes = {
    //     include: [
    //       [
    //         db.literal(`(
    //             SELECT product_assets.url
    //             FROM product_assets
    //             WHERE (product_assets.product_id = notifications.order.order_items.product_id
    //             AND notifications.order.order_items.order_id = notifications.ref_id
    //             AND notification.type <> 1)
    //             OR (product_assets.product_id = notifications.product_likes.product_id
    //             AND notification.type = 1)
    //             LIMIT 1
    //           )`),
    //         'thumbnail'
    //       ]
    //     ]
    // };
    
    const include = ['order', 'product'];
    if (req.query.pageSize && !isNaN(req.query.pageSize) && parseInt(req.query.pageSize) > 0) {
      
      return Pagination.paging(req, res, db.models.notifications, clause, include);
    } else {
      clause.include = include;
      const notifications = await db.models.notifications.findAll(clause);
      
      return BaseResponse.Success(res, 'Notifications', {
        data: notifications
      })
    }
  }

  async countUnread(req, res, next) {
    try {
      let clause = {};
      clause.where = {
        is_read: 0,
      };
      
      clause.where.user_id = req.query.user_id && !isNaN(req.query.user_id) ? {[Op.in]: [parseInt(req.query.user_id), req.user.id]} : req.user.id;
      
      const {type} = req.query;

      if (type && (type === 'merchant' || type === 'admin')) {
        const { where } = clause;
        const { user_id, ...rest } = where;
        const targetUserId = req.query.user_id && !isNaN(req.query.user_id) ? {[Op.in]: [parseInt(req.query.user_id), req.user.id]} : req.user.id;
        const query = type === 'merchant' ? {[Op.or]: [
          // {
          //   user_id,
          // },
          {
            target_user_id: targetUserId,
          }
        ]} : {};

        clause.where = {
          ...rest,
          ...query,
        }
      } else {
        clause.where.type = { [Op.ne]: TYPE.PRODUCT_LIKE };
      }

      const result = await db.models.notifications.count(clause);
      return BaseResponse.Success(res, 'Total unread notification ', { data: result });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
  
  async detailNotification(req, res) {
    const notificationId = req.params.id;
    const notification = await db.models.notifications.findOne({
      where: {
        id: notificationId
      }
    });
    
    if(!req.user.is_superadmin && notification.target_user_id !== req.user.id) return BaseResponse.BadResponse(res, 'Something went wrong');
    
    return BaseResponse.Success(res, 'Notification Successfully Received', {notification});
  }
  
  async testEmailNotif(req, res) {
    
    const notifdata = await db.models.notifications.findOne({
      where: {
        id: parseInt(req.query.notification_id),
      },
      include: ['user']
    });
    
    await EmailNotificationHandler.sendEmailNotification(
      notifdata.user,
      notifdata.type,
      notifdata.title,
      notifdata.description,
      'miqdad',
      'miqdad.farcha@store.backend.fdc'
    );
    
    return BaseResponse.Success(res, 'Test Email Notifications', {
      data: notifdata
    })
  }
  
  async testNotif(req, res) {
    const orderId = parseInt(req.query.order_id);
    const orderNotifData = await db.models.orders.findOne({
      where: {
        id: orderId,
      }
    });
    // const orderItems = await db.models.order_items.findAll({
    //     where: {
    //         order_id: 10,
    //     },
    //     // include: ['product']
    // });
    
    // const order_items = orderItems.map(obj => {
    //     const objitems = obj.toJSON();
    //     // const objprod = obj.product.toJSON();
    //     // objprod.product_id = objprod.id;
    //     // delete objprod.id;
    //     // delete objprod.variant;
    //     return { ...objitems, ...objprod };
    // });
    const order_logs = await db.models.order_logs.findOne({
      where: {
        order_id: orderId,
      },
      order: [['id', 'DESC']]
    });
    const objorder = orderNotifData.toJSON();
    const orderLogs = order_logs.toJSON();
    delete orderLogs.id;
    const order_notif_obj = {...objorder, ...orderLogs};
    
    const order_notif = JSON.stringify(order_notif_obj, (k, v) => v && typeof v === 'object' ? v : '' + v);
    
    const order_parse = JSON.parse(order_notif);
    
    await PushNotificationHandler.sendPushNotification(orderNotifData.user_id, "Notification", "Testing Notification feature", order_parse);
    
    return BaseResponse.Success(res, 'Notification Test', {
      data: order_parse
    })
  }
  
  async testNotifJsonStringify(req, res) {
    const orderId = parseInt(req.query.order_id);
    const order = await db.models.orders.findOne({
      where: {
        id: orderId,
      }
    });
    const order_items = await db.models.order_items.findAll({
      where: {
        order_id: order.id,
      },
      include: [{
        model: db.models.products,
        as: 'product',
        attributes: ['id', 'name', 'brand_name', 'category_name', 'delivery_name', 'merchant_name',
          'code', 'description', 'product_details', 'brand_id', 'category_id', 'delivery_id', 'merchant_id'],
        include: [{
          model: db.models.product_assets,
          as: 'product_assets',
          attributes: ['id', 'url', 'description', 'is_image', 'status']
        }]
      }]
    });
    const order_logs = await db.models.order_logs.findAll({
      where: {
        order_id: order.id,
      },
      order: [['id', 'DESC']]
    });
    const orderItems = order_items.map(obj => {
      const objitems = obj.toJSON();
      
      let objprodasset = [];
      if (obj.product.product_assets && obj.product.product_assets.length > 0) {
        objprodasset = obj.product.product_assets.map(elem => {
          return elem.toJSON();
        });
      }
      
      const objprod = obj.product.toJSON();
      
      return {...objitems, product: {...objprod, product_assets: objprodasset}};
    });
    // const orderLogs = order_logs.map(obj => {
    //     return obj.toJSON();
    // });
    const orderLogs = order_logs[0].toJSON();
    const objOrder = order.toJSON();
    
    const notif_obj_order = JSON.stringify(objOrder, (k, v) => v && typeof v === 'object' ? v : '' + v);
    const notif_obj_order_logs = JSON.stringify(orderLogs, (k, v) => v && typeof v === 'object' ? v : '' + v);
    const notif_obj_order_items = JSON.stringify(orderItems, (k, v) => v && typeof v === 'object' ? v : '' + v);
    
    const order_notif_obj = {
      order: notif_obj_order,
      order_logs: notif_obj_order_logs,
      order_items: notif_obj_order_items
    };
    
    await PushNotificationHandler.sendPushNotification(order.user_id, "Notification", "Testing Notification feature", order_notif_obj);
    
    
    const notif_obj_order_parse = JSON.parse(notif_obj_order);
    const notif_obj_order_logs_parse = JSON.parse(notif_obj_order_logs);
    const notif_obj_order_items_parse = JSON.parse(notif_obj_order_items);
    
    const order_notif_obj_parse = {
      order: notif_obj_order_parse,
      order_logs: notif_obj_order_logs_parse,
      order_items: notif_obj_order_items_parse
    };
    
    return BaseResponse.Success(res, 'Notification Test', {
      data: order_notif_obj_parse
    })
  }
  
  async markAsRead(req, res) {
    
    const notificationId = req.query.notification_id;
    const user = req.user;
    
    const notif = await db.models.notifications.findOne({
      where: {
        id: notificationId
      }
    })
    if (!notif) return BaseResponse.UnprocessableEntity(res, 'Notification not found.');
    
    if (user.is_merchant) {
      if (notif.target_user_id !== user.id) {
        return BaseResponse.BadResponse(res, 'Notification does not belong to you.');
      }
    }

    if (!user.is_merchant && !user.is_superadmin) {
      if (notif.user_id !== user.id) {
        return BaseResponse.BadResponse(res, 'Notification does not belong to you.');
      }
    }

    db.models.notifications.update({
      is_read: isREAD.READ
    }, {
      where: {
        id: notificationId
      }
    }).then(async (result) => {
      const notification = await db.models.notifications.findOne({
        where: {
          id: notificationId
        }
      })
      
      return BaseResponse.Success(res, 'Notification mark as read', {
        data: notification
      })
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
  }
  
  async deleteNotification(req, res) {
    const notificationId = req.query.notification_id;
    const user = req.user;
    
    const notif = await db.models.notifications.findOne({
      where: {
        id: notificationId
      }
    })
    
    if (!notif) return BaseResponse.UnprocessableEntity(res, 'Notification not found.');
    
    if (notif.target_user_id !== user.id) return BaseResponse.BadResponse(res, 'Notification does not belong to you.');
    
    await db.models.notifications.destroy({
      where: {id: notificationId}
    }).then(notification => {
      if (notification) return BaseResponse.Success(res, 'Notification successfully deleted.', {data: notification});
    }).catch(err => {
      return BaseResponse.BadResponse(res, err.message);
    })
    
  }
  
  async createNotificationMerchantProd(product, notiftype, targetUserId, notiftitle = null, notifdescription = null, notifsummary = null) {
    // targetuserid is user who implement the event
    // So we store the target user id into user_id field
    try {
      const notif = await db.models.notifications.findOne({
        where: {
          user_id: targetUserId,
          ref_id: product.id,
          type: notiftype,
          target_user_id: (product.merchants ? product.merchants.user_id : null),
        }
      });
      if (notif) return false;
      
      const target_user = await db.models.users.findOne({
        where: {
          id: targetUserId
        }
      });
      
      const merchant = await db.models.merchants.findOne({
        where: {
          user_id: (product.merchants ? product.merchants.user_id : null),
        },
        include: [{
          model: db.models.users,
          as: 'user',
          include: ['email_notifications', 'push_notifications']
        }]
      });
      const merchantname = merchant ? merchant.user : "your";
      const targetUserName = target_user ? target_user.name : "Someone";
      if (notiftype == TYPE.PRODUCT_LIKE) {
        notiftitle = `Someone ${TYPE_LABEL[notiftype]} your product`;
        notifdescription = `${targetUserName}  ${TYPE_LABEL[notiftype]} your product`;
        notifsummary = `${targetUserName}  ${TYPE_LABEL[notiftype]} ${merchantname} product`;
      } else {
        notiftitle = `We have ${TYPE_LABEL[notiftype]} updates for you`;
        notifdescription = `Hello ${targetUserName}, we have ${TYPE_LABEL[notiftype]} updates for you`;
        notifsummary = `${targetUserName} have ${TYPE_LABEL[notiftype]} updates`;
      }
      
      const product_assets = await db.models.product_assets.findOne({where: {product_id: product.id}});
      
      const data = {
        user_id: targetUserId,
        ref_id: product.id,
        type: notiftype,
        target_user_id: (product.merchants ? product.merchants.user_id : null),
        title: notiftitle,
        description: notifdescription,
        summary: notifsummary,
        thumbnail: product_assets ? product_assets.url : null
      };
      
      const notification = await db.models.notifications.create(data);
      
      //=== Email and Push Notification. Check notification settings
      const obj_notif = JSON.stringify(data, (k, v) => v && typeof v === 'object' ? v : '' + v);
      const notif_parse = JSON.parse(obj_notif);
      if (merchant) await EmailNotificationHandler.sendEmailNotification(merchant.user, notiftype);
      if (notiftype == TYPE.ORDER_PAID) {
        await PushNotificationHandler.sendPushNotification(data.user_id, notiftitle, notifdescription, notif_parse);
      }
      //=============================
      
      return true;
    } catch (err) {
      console.log("Error in creating notification: ", err.message);
    }
    
    return false;
  }
  
  async createNotificationStoreUpdates(merchant, notiftype, targetUserId = null, notiftitle = "STORE BACKEND", notifdescription = "Store Updates", notifsummary = null) {
    try {
      let clause = {};
      clause.where = {
        user_id: merchant.user_id,
        ref_id: merchant.id,
        type: notiftype
      };
      
      if (targetUserId) clause.where.target_user_id = targetUserId;
      
      const notif = await db.models.notifications.findOne(clause);
      
      if (notif) return false;
      
      const user = await db.models.users.findOne({
        where: {
          id: merchant.user_id
        }
      });
      const data = {
        user_id: merchant.user_id,
        ref_id: merchant.id,
        type: notiftype,
        target_user_id: targetUserId,
        title: notiftitle,
        description: notifdescription,
        summary: notifsummary,
        thumbnail: merchant.acra_business_profile ? merchant.acra_business_profile : null
      };
      const notification = await db.models.notifications.create(data);
      
      //=== Email and Push Notification. Check notification settings
      const obj_notif = JSON.stringify(data, (k, v) => v && typeof v === 'object' ? v : '' + v);
      const notif_parse = JSON.parse(obj_notif);
      await EmailNotificationHandler.sendEmailNotification(user, notiftype);
      if (notiftype == TYPE.ORDER_PAID) {
        await PushNotificationHandler.sendPushNotification(merchant.user_id, notiftitle, notifdescription, notif_parse);
      }
      //=============================
      
      return true;
    } catch (err) {
      console.log("Error in creating notification: ", err.message);
    }
    
    return false;
  }
  
  async createNotificationOrderUpdates(order, notiftype, targetUserId = null, notiftitle = "STORE BACKEND", notifdescription = "Order Updates", notifsummary = null) {
    try {
      
      // const order = await db.models.orders.findAll({
      //     where: {
      //         id: order.id,
      //     }
      // });
      
      const order_items = await db.models.order_items.findAll({
        where: {
          order_id: order.id,
        },
        include: [{
          as: 'product',
          model: db.models.products,
          include: ['product_assets', 'merchants']
        }]
      });
      
      const order_logs = await db.models.order_logs.findOne({
        where: {
          order_id: order.id,
        },
        order: [['id', 'DESC']]
      });
      
      const orderItems = order_items.map(obj => {
        const objitems = obj.toJSON();
        return {...objitems};
      });
      
      // const orderLogs = order_logs.map(obj => {
      //     return obj.toJSON();
      // });
      
      
      const objOrder = order;
      const orderLogs = order_logs.toJSON();
      delete orderLogs.id;
      // const order_notif_obj = { order: objOrder, orderItems: order_items, order_logs: orderlogs};
      const order_notif_obj = {...objOrder, ...orderLogs};
      
      const order_notif = JSON.stringify(order_notif_obj, (k, v) => v && typeof v === 'object' ? v : '' + v);
      const order_parse = JSON.parse(order_notif);
      
      let clause = {};
      clause.where = {
        user_id: order.user_id,
        ref_id: order.id,
        type: notiftype
      };
      
      if (targetUserId) clause.where.target_user_id = targetUserId;
      
      const notif = await db.models.notifications.findOne(clause);

      if (notif) return false;
      
      const user = await db.models.users.findOne({
        where: {
          id: order.user_id
        },
        include: [
          {
            model: db.models.email_notifications,
            as: 'email_notifications'
          },
        ]
      });
      const product_assets = await db.models.product_assets.findOne({
        where: {
          product_id: order_items[0] ? order_items[0].product_id : null
        }
      });
      
      const notification = await db.models.notifications.create({
        user_id: order.user_id,
        ref_id: order.id,
        type: notiftype,
        target_user_id: targetUserId,
        title: notiftitle,
        description: notifdescription,
        summary: notifsummary,
        thumbnail: product_assets ? product_assets.url : null
      });
      
      //=== Email and Push Notification. Check notification settings
      if (notiftype == TYPE.ORDER_PAID) {
  
        const orderItemEmailRequest = [];
        for(const order_item of order_items){
          orderItemEmailRequest.push({
            img: order_item.product?.product_assets[0]?.url,
            product_name: order_item.product.name,
            quantity: order_item.quantity,
            price: `$${order_item.item_price * order_item.quantity}`
          })
        }

        // Check email notification settings
        const emailNotification = (user.email_notifications || [])[0] ?? {};
        if (emailNotification.status) {
          await EmailNotificationHandler.sendEmailNotificationWithTemplate(user, {
            id: 'd-4a1426281225437093cdd3d25cd0d77e',
            data: {
              order_id: `ORD-${StrHelper.padNumber(order.id, 6)}`,
              order_date: moment(order.created_at).format('YYYY-MM-DD HH:mm'),
              order_items: orderItemEmailRequest
            }
          }, 'Order Placed');
        }
        // await EmailNotificationHandler.sendEmailNotification()
        // await PushNotificationHandler.sendPushNotification(order.user_id,notiftitle,notifdescription,order_notif);
        await PushNotificationHandler.sendPushNotificationById(order.user_id, notiftitle, notifdescription, order.id);
        // TODO : Send email notification to merchant
        const merchant = await db.models.users.findOne({
          where: {
            id: order_items[0]?.product.merchants.user_id
          }
        })
        
        await EmailNotificationHandler.sendEmailNotificationWithTemplate(merchant, {
          id: 'd-6cf51be1e950424e97a771155019ae06',
          data: {
            buyer: user.name,
            name: merchant.name,
            order_id: `ORD-${StrHelper.padNumber(order.id, 6)}`,
          }
        });
      }
      //=============================
      
      return true;
    } catch (err) {
      console.log(err)
      console.log("Error in creating notification: ", err.message);
    }
    return false;
  }
  
  // async createNotificationOrderUpdates(order, type, target_user_id = null, title = "STORE BACKEND", description = "Order Updates", summary = null) {
  //     try{
  
  //         const order_items = await db.models.order_items.findAll({
  //             where: {
  //                 order_id: order.id,
  //             },
  //             include: [{
  //                 model: db.models.products,
  //                 as: 'product',
  //                 attributes: ['id','name','brand_name','category_name','delivery_name','merchant_name',
  //                             'code','description','product_details','brand_id','category_id','delivery_id','merchant_id'],
  //                 include: [{
  //                             model: db.models.product_assets,
  //                             as: 'product_assets',
  //                             attributes: ['id','url','description','is_image','status']
  //                         }]
  //             }]
  //         });
  //         const order_logs = await db.models.order_logs.findAll({
  //             where: {
  //                 order_id: order.id,
  //             }
  //         });
  
  //         const orderItems = order_items.map(obj => {
  //             const objitems = obj.toJSON();
  
  //             let objprodasset = [];
  //             if(obj.product.product_assets && obj.product.product_assets.length > 0){
  //                 objprodasset = obj.product.product_assets.map(elem => {
  //                     return elem.toJSON();
  //                 });
  //             }
  
  //             const objprod = obj.product.toJSON();
  
  //             return { ...objitems, product: { ...objprod, product_assets: objprodasset }};
  //         });
  
  //         const orderLogs = order_logs.map(obj => {
  //             return obj.toJSON();
  //         });
  
  //         const objOrder = order.toJSON();
  
  //         const notif_obj_order = JSON.stringify(objOrder, (k, v) => v && typeof v === 'object' ? v : '' + v);
  //         const notif_obj_order_logs = JSON.stringify(orderLogs, (k, v) => v && typeof v === 'object' ? v : '' + v);
  //         const notif_obj_order_items = JSON.stringify(orderItems, (k, v) => v && typeof v === 'object' ? v : '' + v);
  
  //         const order_notif_obj = { order: notif_obj_order, order_logs: notif_obj_order_logs, order_items: notif_obj_order_items };
  
  
  //         let clause = {};
  //         clause.where = {
  //                             user_id: order.user_id,
  //                             ref_id: order.id,
  //                             type: type
  //                         };
  
  //         if(target_user_id) clause.where.target_user_id = target_user_id;
  
  //         const notif = await db.models.notifications.findOne(clause);
  
  //         if(notif) return false;
  
  //         const user = await db.models.users.findOne({
  //             where: {
  //                 id: order.user_id
  //             }
  //         });
  
  //         const notification = await db.models.notifications.create({
  //             user_id: order.user_id,
  //             ref_id: order.id,
  //             type: type,
  //             target_user_id: target_user_id,
  //             title: title,
  //             description: description,
  //             summary, summary
  //         });
  
  //         //=== Email and Push Notification. Check notification settings
  //         if(type == TYPE.ORDER_PAID){
  //             await EmailNotificationHandler.sendEmailNotification(user,type);
  //             await PushNotificationHandler.sendPushNotification(order.user_id,title,description,order_notif_obj);
  
  //             const notif_obj_order_parse = JSON.parse(notif_obj_order);
  //             const notif_obj_order_logs_parse = JSON.parse(notif_obj_order_logs);
  //             const notif_obj_order_items_parse = JSON.parse(notif_obj_order_items);
  
  //             const order_notif_obj_parse = { order: notif_obj_order_parse, order_logs: notif_obj_order_logs_parse, order_items: notif_obj_order_items_parse };
  
  //             // return BaseResponse.Success(res, "You'll received a message notifying you about your order. Thanks!", {
  //             //     data: order_notif_obj_parse
  //             // })
  //         }
  //         //=============================
  
  //         return true;
  //     }catch(err){
  //         console.log("Error in creating notification: ",err.message);
  //     }
  
  //     return false;
  // }
  
  async createNotificationMisc(
    user_id,
    ref_id,
    notiftype,
    targetUserId = null,
    notiftitle = "STORE BACKEND",
    notifdescription = "other notifications",
    notifsummary = null,
  ) {
    let clause = {};
    clause.where = {
      user_id: user_id,
      ref_id: ref_id,
      type: notiftype
    };
    
    if (targetUserId) clause.where.target_user_id = targetUserId;
    
    const notif = await db.models.notifications.findOne(clause);
    
    if (notif) return false;
    
    const user = await db.models.users.findOne({
      where: {
        id: user_id
      }
    });

    const notification = await db.models.notifications.create({
      user_id: user_id,
      ref_id: ref_id,
      type: notiftype,
      target_user_id: targetUserId,
      title: notiftitle,
      description: notifdescription,
      summary: notifsummary,
      thumbnail: user ? user.avatar_url : null
    });
    
    // console.log("notification",notification);
    // === Email and Push Notification. Check notification settings
    
    const obj_notif = JSON.stringify(notification, (k, v) => v && typeof v === 'object' ? v : '' + v);
    const notif_parse = JSON.parse(obj_notif);
    
    // await EmailNotificationHandler.sendEmailNotification(user, notiftype);
    // if (notiftype == TYPE.ORDER_PAID) {
    //   await PushNotificationHandler.sendPushNotification(user_id, notiftitle, notifdescription, obj_notif);
    // }
    //=============================
    
    return true;
  }

  async pushNotification(req, res, next) {
    try {
      const { emails, title, message, data } = req.body;
      console.log('push notifiation emails: ', emails);
      if (!title || !message) {
        return BaseResponse.BadRequest(res, 'Missing params.');
      }

      let whereCaluse = {}

      if (emails && emails.length) {
        whereCaluse = {
          ...whereCaluse,
          email: {
            [Op.in]: emails,
          }
        }
      }

      const users = await db.models.users.findAll({
        where: whereCaluse,
        include: ['user_fcms'],
      });

      const fcmTokens = users.map(u => u.user_fcms?.fcm_token || null).filter(item => !!item);
      console.log('fcmTokens: ', fcmTokens);
      const results = await FcmHelper.pushNotificationToMultipleDevices({
        userFcmTokens: fcmTokens,
        title,
        description: message,
        data,
      });

      return BaseResponse.Success(res, 'Send notifications successfully.', { data: results });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async readAllNotifications(req, res, next) {
    try {
      const { type } = req.query;
      let clause = {
        where: { is_read: 0 },
      };
      
      clause.where.user_id = req.query.user_id && !isNaN(req.query.user_id) ? {[Op.in]: [parseInt(req.query.user_id), req.user.id]} : req.user.id;

      if (type && (type === 'merchant' || type === 'admin')) {
        const { where } = clause;
        const { user_id, ...rest } = where;
        const targetUserId = req.query.user_id && !isNaN(req.query.user_id) ? {[Op.in]: [parseInt(req.query.user_id), req.user.id]} : req.user.id;
        const query = type === 'merchant' ? {[Op.or]: [
          {
            user_id,
          },
          {
            target_user_id: targetUserId,
          }
        ]} : {};
  
        clause.where = {
          ...rest,
          ...query,
        }
      }

      const updated = await db.models.notifications.update({
        is_read: 1,
      }, {
        ...clause,
      });

      return BaseResponse.Success(res, 'Read all success', { data: updated });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new NotificationHandler;
module.exports.TYPE = TYPE;
