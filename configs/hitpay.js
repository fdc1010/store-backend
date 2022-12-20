const axios = require('axios');

const BASE_URL = process.env.HITPAY_BASEURL || 'https://api.sandbox.hit-pay.com/v1/';

module.exports = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'X-BUSINESS-API-KEY': process.env.HITPAY_KEY || 'your-hitpay-key'
  }
});