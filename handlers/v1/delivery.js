const { DELIVERY_TYPE } = require('../../configs');
const DeliveryService = require('../../services/lalamove.service');

class DeliveryHandler {
  async getQuotation(req, res, next) {
    try {
      const {
        transport_type = DELIVERY_TYPE.MOTORCYCLE,
        shop,
        destination,
      } = req.body;

      const data = DeliveryService.prepareQuationBody({
        shop,
        destination,
        serviceType: transport_type
      });

      const {success, quotation, message} = await DeliveryService.getQuotation({data});
      if (!success) {
        return BaseResponse.BadRequest(res, message);
      }

      return BaseResponse.Success(res, 'Quotation', {data: quotation});
    } catch (err) {
      console.log(err);
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async placeOrder(req, res, next) {
    try {
      const {
        transport_type = DELIVERY_TYPE.MOTORCYCLE,
        shop,
        destination,
        totalFee,
        currency
      } = req.body;

      const quotationData = DeliveryService.prepareQuationBody({
        shop,
        destination,
        serviceType: transport_type
      });

      const params = {
        quotedTotalFee: {
          amount: totalFee,
          currency,
        },
        sms: false,
        ...quotationData,
      }

      const order = await DeliveryService.createOrder({params});
      
      return BaseResponse.Success(res, 'Place order', {data: order});
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getOrderDetails(req, res, next) {
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const details = await DeliveryService.getOrderDetails({id});
      return BaseResponse.Success(res, 'Order details', { data: details });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getDriverDetails(req, res, next) {
    try {
      const {orderRef, driverId} = req.params;
      if (!orderRef || !driverId) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const driverInfo = await DeliveryService.getDriverDetails({ orderRef, driverId });
      return BaseResponse.Success(res, 'Driver details', { data: driverInfo });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async getDriverLocation(req, res, next) {
    try {
      const {orderRef, driverId} = req.params;
      if (!orderRef || !driverId) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const location = await DeliveryService.getDriverLocation({ orderRef, driverId });
      return BaseResponse.Success(res, 'Driver location', { data: location });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const {id} = req.params;
      if (!id) {
        return BaseResponse.BadRequest(res, 'Missing params');
      }

      const canceledOrder = await DeliveryService.cancelOrder({ orderRef: id });

      return BaseResponse.Success(res, 'Cancel order', { data: canceledOrder });
    } catch (err) {
      return BaseResponse.BadResponse(res, err.message);
    }
  }
}

module.exports = new DeliveryHandler();
