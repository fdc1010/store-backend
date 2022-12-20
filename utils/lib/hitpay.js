const axios = require('../../configs/hitpay');

class HitpayHelper {
  createPayment(order) {
    const name = order.user ? order.user.name : null;
    const email = order.user ? order.user.email : null;

    return axios.post('/payment-requests', {
      amount: order.total,
      currency: 'SGD',
      name: name,
      email: email,
      webhook: `${process.env.BASE_URL}order/_webhook/hitpay`,
    }).then(res => res.data);
  }

  getPaymentStatus(id) {
    return axios.get(`/payment-requests/${id}`)
      .then(res => res.data);
  }

  deletePayment(id) {
    return axios.delete(`/payment-requests/${id}`)
      .then(res => res.data);
  }
}

module.exports = new HitpayHelper;
