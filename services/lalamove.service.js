const axios = require('axios');
const CryptoJS = require('crypto-js');

const BASE_URL = process.env.LALAMOVE_BASEURL || 'https://rest.sandbox.lalamove.com';
const API_KEY = process.env.LALAMOVE_API_KEY;
const SECRET = process.env.LALAMOVE_API_SECRET;
const MARKET = process.env.LALAMOVE_MARKET;

class LalamoveService {
  constructor() {
    this.Http = axios.create({
      baseURL: BASE_URL,
      headers: {
        'X-LLM-market': MARKET,
      }
    });

    this.ERRORS = {
      CANCEL_ORDER: 'ERR_CANCELLATION_FORBIDDEN',
      DELIVERY_MISSMATCH: 'ERR_DELIVERY_MISMATCH',
      PHONE_INVALID: 'ERR_INVALID_PHONE_NUMBER',
      TOPUP_WALLET: 'ERR_INSUFFICIENT_CREDIT',
      ERR_OUT_OF_SERVICE_AREA: 'ERR_OUT_OF_SERVICE_AREA',
    }
  }

  /**
   * Generate authorization token for lalamove
   * @param {string} method
   * @param {string} body
   * @param {string} path
   * @param {timestamp} timestamp
   * @returns {object} signature and time
   */
  generateSignature({ method, path, body, timestamp }) {
     // Should have method and path
    if (!method || !path) {
      return null;
    }
    const time = timestamp || new Date().getTime().toString();
    const rawSignature = `${time}\r\n${method}\r\n${path}\r\n\r\n${body}`;
    return {
      time,
      signature: CryptoJS.HmacSHA256(rawSignature, SECRET).toString(),
    };
  }

  /**
   * Generate authorization token for lalamove
   * @param {string} method
   * @param {string} body
   * @param {string} path
   * @returns {string} token
   */
  generateAuthorizationToken({method, path, body = ''}) {
    // Should have method and path
    if (!method || !path) {
      return null;
    }

    const {
      time,
      signature
    } = this.generateSignature({ method, path, body });
    return `hmac ${API_KEY}:${time}:${signature}`;
  }

  prepareHeader(token) {
    return {
      'Content-type': 'application/json; charset=utf-8',
      Authorization: token,
      Accept: 'application/json',
    }
  };

  parseQuotationAddress(rawAddress) {
    const { location, addresses } = rawAddress;

    return {
      location,
      addresses: {
        en_SG: {
          displayString: addresses,
          market: MARKET,
        }
      }
    }
  }

  parseQuotationPhone(rawPhone) {
    return (rawPhone || '').split(' ').join('');
  }

  /**
   * 
   * @param {Object} shop // shop information - contact and address 
   * @param {Object} destination // destination information - contact and address
   * @param {String} serviceType // type of transportation
   * @param {Array<String>} specialRequests
   * @returns 
   */

  prepareQuationBody({shop, destination, serviceType, specialRequests = []}) {
    // const { contact, address } = shop;
    
    const shopContact = shop.contact;
    const shopAdress = this.parseQuotationAddress(shop.address);
    const destinationContact = destination.contact;
    const destinationAddress = this.parseQuotationAddress(destination.address);

    const stops = [shopAdress];
    stops.push(destinationAddress);
    
    const deliveries = [{
      toStop: 1,
      toContact: destinationContact
    }];

    return {
      serviceType,
      specialRequests,
      requesterContact: shopContact,
      stops,
      deliveries,
    };
  }

  handleError(err) {
    // TODO: Shoud log the error
    console.log('lalamove err: ', err);
    
    const {response: {data}} = err || {response: {}};
    let message = data?.message ?? err.message;
    switch (message) {
      case this.ERRORS.CANCEL_ORDER: {
        message = 'Driver is handling your order. Order Cannot be canceled';
        break;
      }
      case this.ERRORS.PHONE_INVALID: {
        message = 'Phone invalid. Please check your phone number.';
        break;
      }
      case this.ERRORS.ERR_OUT_OF_SERVICE_AREA: {
        message = 'Invalid address for Singapore.';
        break;
      }
      case this.ERRORS.ERR_INSUFFICIENT_CREDIT:
      default:
        message = 'Something went wrong. Please try again later';
    }
    
    
    return {success: false, message};
  }

  /**
   * Get quotation
   * @param {Object} data
   * @returns {Promise<[Response, {}]>}
   */
  async getQuotation({data}) {
    return new Promise((resolve, reject) => {
      const method = 'POST';
      const path = '/v2/quotations';
      const authToken = this.generateAuthorizationToken({method, path, body: JSON.stringify(data)});
      const headers = this.prepareHeader(authToken);
      return this.Http.post(path, JSON.stringify(data), {
        headers,
      }).then((result) => {
        return resolve({
          success: true,
          quotation: result.data,
        });
      }).catch(err => resolve(this.handleError(err)));
    });
  }

  async createOrder({params}) {
    return new Promise((resolve, reject) => {
      const method = 'POST';
      const path = '/v2/orders';
      const authToken = this.generateAuthorizationToken({method, path, body: JSON.stringify(params)});
      const headers = this.prepareHeader(authToken);
      return this.Http.post(path, JSON.stringify(params), {
        headers,
      }).then((result) => {
        return resolve(result.data);
      }).catch(err => resolve(this.handleError(err)));
    });
  }

  /**
   * 
   * @param {string} id
   * @returns {Object}
   */
  async getOrderDetails({ id }) {
    return new Promise((resolve, reject) => {
      const method = 'GET';
      const path = `/v2/orders/${id}`;
      const authToken = this.generateAuthorizationToken({ method, path });
      const headers = this.prepareHeader(authToken);
      return this.Http.get(path, {
        headers
      }).then((result) => {
        return resolve(result.data);
      }).catch(err => resolve(this.handleError(err)));
    })
  }

  async getDriverDetails({ orderRef, driverId }) {
    return new Promise((resolve, reject) => {
      const method = 'GET';
      const path = `/v2/orders/${orderRef}/drivers/${driverId}`;
      const authToken = this.generateAuthorizationToken({ method, path });
      const headers = this.prepareHeader(authToken);
      return this.Http.get(path, {
        headers
      }).then((result) => {
        return resolve(result.data);
      }).catch(err => resolve(this.handleError(err)));
    });
  }

  async getDriverLocation({ orderRef, driverId }) {
    return new Promise((resolve, reject) => {
      const method = 'GET';
      const path = `/v2/orders/${orderRef}/drivers/${driverId}/location`;
      const authToken = this.generateAuthorizationToken({ method, path });
      const headers = this.prepareHeader(authToken);
      return this.Http.get(path, {
        headers
      }).then((result) => {
        return resolve(result.data);
      }).catch(err => resolve(this.handleError(err)));
    });
  }

  async cancelOrder({ orderRef }) {
    return new Promise((resolve, reject) => {
      const method = 'PUT';
      const path = `/v2/orders/${orderRef}/cancel`;
      const authToken = this.generateAuthorizationToken({ method, path, body: JSON.stringify({}) });
      const headers = this.prepareHeader(authToken);
      return this.Http.put(path, {}, {
        headers
      }).then((result) => {
        return resolve({success: true});
      }).catch(err => resolve(this.handleError(err)));
    });
  }
}

module.exports = new LalamoveService();
