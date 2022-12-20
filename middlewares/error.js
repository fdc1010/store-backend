function notFoundHandler(req, res, next) {
  return BaseResponse.NotFound(res);
}

function errorHandler(err, req, res, next) {
  return BaseResponse.InternalServerError(res, err);
}

module.exports = {
  notFoundHandler,
  errorHandler
}
