const axios = require('axios');
const moment = require('../configs/moment');

const NODE_ENV = process.env.NODE_ENV;
const BASE_URL = process.env.JTEXPRESS_BASE_URL;
const JTEXPRESS_USERNAME = process.env.JTEXPRESS_USERNAME;
const JTEXPRESS_PASSWORD = process.env.JTEXPRESS_PASSWORD;
const JTEXPRESS_MERCHANT_CODE = process.env.JTEXPRESS_MERCHANT_CODE;

class JTExpressService {
  constructor() {
    this.Http = axios.create({
      baseURL: BASE_URL,
    });
    
    this.JTEXPRESS_ACCESS_TOKEN = null;
    this.JTEXPRESS_REFRESH_TOKEN = null;

    this.JTEXPRESS_PASSWORD = JTEXPRESS_PASSWORD;
    this.JTEXPRESS_USERNAME = JTEXPRESS_USERNAME;
    this.DEFAULT_WEIGHT_FEE = 3.4;

    this.WEIGHT_FEE = {
      range: [
        {
          min: 0,
          max: 1,
          fee: 3,
        },
        {
          min: 1,
          max: 5,
          fee: 3.4,
        },
        {
          min: 5,
          max: 10,
          fee: 6,
        },
        {
          min: 10,
          max: 20,
          fee: 7,
        },
        {
          min: 20,
          max: 30,
          fee: 12,
        },
      ],
      extraFee: 0.5,
      maxWeight: 60,
    }
  }

  calculateWeightFee(weight) {
    if (!weight) {
      return this.DEFAULT_WEIGHT_FEE;
    }

    let weightFee = 0;
    let i = 0;
    const weightRange = this.WEIGHT_FEE.range.find(({ min, max }) => weight > min && weight <= max);

    if (weightRange) {
      return weightRange.fee;
    }

    const { extraFee, maxWeight } = this.WEIGHT_FEE;
    const weightFeeLength = this.WEIGHT_FEE.range.length;
    const lastWeightFee = this.WEIGHT_FEE.range[weightFeeLength - 1];
    const { fee, max } = lastWeightFee;
    const extraWeight = Math.ceil(weight - max);
    weightFee = fee + extraWeight * extraFee;

    return weightFee;
  }

  errorHandlers(error) {
    return {
      success: false,
      error,
    }
  }

  responseHandler(data) {
    const { status, message } = data;
    console.log('response data: ', data);
    if (status && status >= 400 && status < 500) {
      return {
        success: false,
        error: message,
      }
    }

    return {
      success: true,
      data,
    }
  }

  prepareHeaders() {
    return {
      'Content-Type' : 'application/json',
      'Authorization' : `JWT ${this.JTEXPRESS_ACCESS_TOKEN}`,
    }
  }

  async getJTExpressAccessToken() {
    try {
      const loginToken = this.generateLoginToken();
      const url = '/api/gateway/v1/auth/login';
      const result = await this.Http.post(
        url,
        null,
        {
          headers: {
            Authorization: `Basic ${loginToken}`,
          }
        }
      );

      const { data } = result;
      const { token, refreshToken } = data;
      this.JTEXPRESS_REFRESH_TOKEN = refreshToken;
      this.JTEXPRESS_ACCESS_TOKEN = token;
      console.log(data);
      return {
        success: true,
        data,
      }
    } catch (err) {
      console.log('getJTAccessToken err: ', err);
      return this.errorHandlers(err);
    }
  }

  async createDomesticOrder(body) {
    try {
      const headers = this.prepareHeaders();
      const url = '/api/gateway/v1/deliveries';
      const result = await this.Http.post(url, body, { headers });
      const { data } = result;
      // return result;
      // return {
      //   success: true,
      //   data,
      // }
      return this.responseHandler(data);
    } catch (err) {
      console.log('create domestic order err: ', err);
      return this.errorHandlers(err);
    }
  }

  generateLoginToken() {
    const token = `${this.JTEXPRESS_USERNAME}:${this.JTEXPRESS_PASSWORD}`
    return Buffer.from(token).toString('base64');
  }

  prepareOrderData(rawData) {
    try {
      const pickupDate = moment().add(1, 'd');
      const merchant_code = this.JTEXPRESS_MERCHANT_CODE;
      const reference_number = rawData.refOrderNo;
      const service_code = 'DOM123';
      const pickup_details = {
        contact_name: rawData.merchantName,
        phone_number: rawData.merchantPhone,
        email: rawData.merchantEmail,
        address: rawData.merchantAddress,
        postcode: rawData.merchantPostalCode,
        date: pickupDate.toISOString(),
      }

      const consignee_details = {
        contact_name: rawData.rcptName,
        phone_number: rawData.rcptMobile,
        email: rawData.rcptEmail,
        address: rawData.rcptAddr1,
        postcode: rawData.rcptZipcode,
      }

      const { orderItems } = rawData;
      const item_details = orderItems.map((item) => {
        const { product, variant } = item;
        const productVariant = product.variant[0]?.value.find(item => item.name === variant) || {};
        const { width = 0, height = 0, weight = 1.1 } = productVariant;
        return {
          width,
          weight: weight || 1.1,
          height,
          weight_unit: 'Kg',
          description: product.name,
        };
      })

      return {
        merchant_code,
        reference_number,
        service_code,
        pickup_details,
        consignee_details,
        item_details,
    }
    } catch (err) {
      console.log('prepare order data for deilivery err: ', err);
      return this.errorHandlers(err);
    }
  }

  prepareCancelOrderData(trackingIds, reason) {
    try {
      return {
        data: {
          ids: trackingIds,
          reason,
        },
        type: 'CANCEL',
      }
    } catch (err) {
      console.log('prepare cancel delivery order data err: ', err);
      return this.errorHandlers(err);
    }
  }

  async cancelDeliveryOrder(body) {
    try {
      const headers = this.prepareHeaders();
      const url = '/api/gateway/v1/deliveries/operation';
      const result = await this.Http.post(url, body, { headers });
      const { data } = result;
      return this.responseHandler(data);
    } catch(err) {
      console.log('Cancel delivery order err: ', err);
      return this.errorHandlers(err);
    }
  }

  async getConnote(trackingId) {
    try {
      const headers = this.prepareHeaders();
      const url = `/api/gateway/v1/deliveries/connote/${trackingId}/a6`;
      const result = await this.Http.get(url, { headers });
      const { data } = result;
      return this.responseHandler(data);
    } catch (err) {
      console.log('get connote err: ', err);
      return this.errorHandlers(err);
    }
  }
}

module.exports = JTExpressService;
