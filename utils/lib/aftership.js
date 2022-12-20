const axios = require('axios');

const AFTERSHIP_BASE_URL = process.env.AFTERSHIP_BASE_URL || 'https://api.aftership.com/v4';

const client = axios.create({
  baseURL: AFTERSHIP_BASE_URL,
  headers: {
    'aftership-api-key': process.env.AFTERSHIP_API_KEY || 'aftership-api-key',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})


class AftershipAPIHelper {
  getAllCouriers() {
    return client.get('/couriers/all')
      .then(res => res.data);
  }

  detectCourier(trackingNumber, options = {}) {
    return client.post('/couriers/detect', {
      tracking_number: trackingNumber,
      ...options
    }).then(res => res.data);
  }

  createTracking(trackingNumber, options = {}) {
    return client.post('/trackings', {
      tracking: {
        tracking_number: trackingNumber,
        ...options
        }
    }).then(res => res.data)
      .catch(err => {
        console.log(err.response);
      })
  }

  getTrackings(options = {}) {
    return client.get('/trackings', {
      params: options
    }).then(res => res.data);
  }

  getTrackingDetail(tracking_id, slug, options = {}) {
    return client.get(`/trackings/${slug}/${tracking_id}`, {
      params: options,
    }).then(res => res.data);
  }
}

module.exports = new AftershipAPIHelper;