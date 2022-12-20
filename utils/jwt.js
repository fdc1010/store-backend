const jwt = require('jsonwebtoken')

class JwtHelper {
  async generateJwt(data) {
    const expiredTime = 60 * 60 * 24 * 7; // 7 days

    const jwtToken = await jwt.sign({
      user: data,
      // exp: Math.floor(Date.now() / 1000) + (expiredTime),
    }, process.env.JWT_SECRET || 'secret');

    return {
      type: 'Bearer',
      expiredTime,
      value: jwtToken,
    };
  }
}

module.exports = new JwtHelper
