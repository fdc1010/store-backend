const axios = require('axios');
const querystring = require('querystring');

const INVEST_BASE_URL = process.env.INVEST_BASE_URL;
const INVEST_USERNAME = process.env.INVEST_USERNAME;
const INVEST_PASSWORD = process.env.INVEST_PASSWORD;
const INVEST_API_KEY = process.env.INVEST_API_KEY; 

const client = axios.create({
  baseURL: INVEST_BASE_URL,
  auth: {
    username: INVEST_USERNAME,
    password: INVEST_PASSWORD
  },
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

class StrInvest {
  login(username, password) {
    return client.post('/User/Login', querystring.stringify({
      username,
      password
    })).then(res => res.data);
  }

  getProfileDetail(token) {
    return client.get('/Profile/View', {
      params: {
        token
      }
    }).then(res => res.data);
  }

  async getProfileByEmail(email) {
    const response = await client.get('/User/Profile', {
      params: {
        email,
        apiKey: INVEST_API_KEY,
      }
    });

    return response.data;
  }

  // getRewards(user_id, token) {
  //   return client.get('/StoreReward/List', {
  //     params: {
  //       user_id,
  //       token
  //     }
  //   }).then(res => res.data);
  // }
  getRewards(token) {
    return client.get('/Reward/List', {
      params: {
        token
      }
    }).then(res => res.data);
  }

  updateRewards(token, points) {
    return client.post('/Reward/update', querystring.stringify({
      apiKey: token,
      points
    }))
  }

  generateAvatarUrlWithAPIKEY(url) {
    return url ? `${url}&apikey=${INVEST_API_KEY}` : '';
  }
}

module.exports = new StrInvest;
