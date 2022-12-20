const axios = require('axios');

class TrackingMoreAPI {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.TRACKINGMORE_URL || 'https://api.trackingmore.com/v2/',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Trackingmore-Api-Key': process.env.TRACKINGMORE_KEY || 'secret-key'
      }
    })
  }
  
  /**
   * Get list of couriers
   * @returns {Promise<any | *[]>}
   */
  getCourierList() {
    return this.client.get('carriers')
      .then(response => response.data)
      .then(data => data ? data.data : [])
      .catch(err => {
        console.error(err)
      })
  }
  
  /**
   * Track delivery
   * @param {string} trackingNumber
   * @returns {Promise<AxiosResponse<any>>}
   */
  detectCourierDelivery(trackingNumber) {
    return this.client.post('carriers/detect', {
        tracking_number: trackingNumber
      })
      .then(response => response.data)
      .then(data => {
        if (data.meta.code === 200) {
          return data.data[0];
        } else {
          throw new Error(JSON.stringify(data))
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
  
  createSingleTracking(trackingNumber, carrierCode, options = {}) {
    return this.client.post('trackings/post', {
      tracking_number: trackingNumber,
      carrier_code: carrierCode,
      ...options
    }).then(response => response.data)
      .then(data => {
        if (data.meta.code === 200) {
          return data.data;
        } else {
          throw new Error(JSON.stringify(data))
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
  
  getSingleTrackingResult(trackingNumber, carrierCode) {
    return this.client.get(`trackings/${carrierCode}/${trackingNumber}`)
      .then(response => response.data)
      .then(data => {
        if (data.meta.code === 200) {
          return data.data;
        } else {
          throw new Error(JSON.stringify(data))
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
  
  createMultipleTracking(trackingData){
    return this.client.post('trackings/batch', trackingData)
      .then(response => response.data)
      .then(data => {
        return data.data;
      })
      .catch(err => {
        console.error(err)
      })
  }
}

module.exports = new TrackingMoreAPI();
