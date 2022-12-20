const axios = require('axios');
const CryptoJS = require('crypto-js');

const JTExpressService = require('./jtexpress.service');

const NODE_ENV = process.env.NODE_ENV;
const BASE_URL = process.env.QXPERSS_BASE_URL || 'https://rest.sandbox.lalamove.com';
const API_KEY = process.env.QXPRESS_API_KEY;
const ACCOUNT_ID = process.env.QXPRESS_ACCOUNT_ID;

class DeliveryService {
  constructor() {
    this.DeliveryServiceInstance = new JTExpressService();
    this.DeliveryServiceInstance.getJTExpressAccessToken();
  }

  // parsePickupOrder({ pickupDate, merchant, orders }) {
  //   try {
  //     const quantity = orders.length;
  //     const { user, postal_code, office_address, office_phone_number } = merchant;
  //     const contactNo = user.contact_no.split(' ');
  //     const officePhone = office_phone_number.split(' ');
  //     return {
  //       pickupDate,
  //       countryCode: 'SG',
  //       zipcode: postal_code,
  //       addr1: office_address,
  //       addr2: office_address,
  //       mobileNo: officePhone[1] || contactNo[1] || '',
  //       quantity,
  //     };
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  // async handleSendRequest(url, body) {
  //   return new Promise((resolve, reject) => {
  //     return this.Http.post(url, body)
  //       .then(result => {
  //         const data = result.data;
  //         const {ResultCode, ResultMsg, ResultObject} = data || { ResultCode: -1 };

  //         if (ResultCode < 0) {
  //           return reject(this.handleError(result));
  //         }
          
  //         return resolve(data);
  //       })
  //       .catch(err => {
  //         return reject(this.handleError(err));
  //       });
  //   });
  // }

  // async createOrder(data) {
  //   console.log('create qxpress order data: ', data);
  //   try {
  //     if (NODE_ENV === 'development') {
  //       const response = {
  //         "ResultObject": {
  //           "ShippingNo": "QSP117546433",
  //           "AreaCode": "0-1"
  //         },
  //         "ResultCode": 0,
  //         "ResultMsg": "Success"
  //       };
  //       return response.ResultObject;
  //     }
  //     const response = await this.handleSendRequest(`/GMKT.INC.GLPS.OpenApiService/SmartShipService.qapi/CreateSimpleOrder?key=${this.API_KEY}&returnType=json`, data);
  //     const { ResultObject } = response;
  //     return ResultObject;
  //   } catch (err) {
  //     console.log('qxpress create order err: ', err);
  //     throw err;
  //   }
  // }

  // async createPickupOrder(data) {
  //   try {
  //     console.log('create qxpress pickup data: ', data);
  //     const body = {
  //       ...data,
  //       apiKey: this.API_KEY,
  //       accountId: this.ACCOUNT_ID,
  //     };

  //     if (NODE_ENV === 'development') {
  //       return {
  //         ResultCode: 0,
  //         ResultMsg: 'QSP117546433',
  //       }
  //     }

  //     const response = await this.handleSendRequest(`/GMKT.INC.GLPS.OpenApiService/PickupOuterService.qapi/CreatePickupOrder`, body);
  //     const { ResultCode, ResultMsg } = response;
  //     return {
  //       ResultCode,
  //       ResultMsg,
  //     }
  //   } catch (err) {
  //     console.log('qxpress create pickup order err: ', err);
  //     throw err;
  //   }
  // }

  // handleError(err) {
  //   const {ResultCode, ResultMsg, ResultObject} = err;
  //   return {success: false, message: ResultMsg || err.message || 'Something went wrong. Please try again later.'};
  // }

  calculateShippingFee(data) {
    if (!data) {
      return null;
    }
    const { weight, width, wide, height } = data;
    return this.DeliveryServiceInstance.calculateWeightFee(weight);
  }

  prepareDeliveryOrderData(rawData) {
    return this.DeliveryServiceInstance.prepareOrderData(rawData);
  }

  async createDeliveryOrder(data) {
    return this.DeliveryServiceInstance.createDomesticOrder(data);
  }

  prepareCancelDeliveryOrderData(trackingIds, reason) {
    return this.DeliveryServiceInstance.prepareCancelOrderData(trackingIds, reason);
  }

  async cancelDeliveryOrder(data) {
    return this.DeliveryServiceInstance.cancelDeliveryOrder(data);
  }

  async getWaybill(deliveryId) {
    return this.DeliveryServiceInstance.getConnote(deliveryId);
  }
}

module.exports = new DeliveryService();
