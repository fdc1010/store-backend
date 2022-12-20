const Response = class {
  static Success(res, message = null, data = null, code = 100, header_title = "Success"){
    return res.send({
      code,
      header_title,
      message,
      ...data
    })
  }

  static NotFound(res, message = 'Not Found', header_title = "Warning"){
    const code = 404;
    return res.status(404).send({
      code,
      header_title,
      message
    })
  }

  static UnprocessableEntity(res, message, data = null, code = 101, header_title = "Warning"){
    res.send({
      code,
      header_title,
      message,
      ...data
    })
  }

  static BadRequest(res, message = null, data = null, header_title = "Error") {
    return res.send({
      code: 400,
      header_title,
      message,
      ...data,
    });
  }

  static BadResponse(res, message = null, data = null, header_title = "Error"){
    const code = 400;
    res.send({
      code,
      header_title,
      message,
      ...data
    })
  }

  static Unauthorized(res, message = 'Unauthorized', header_title = "Warning"){
    const code = 401;
    res.statusCode = code;
    res.send({
      code,
      header_title,
      message
    })
  }

  static Forbidden(res){
    const code = 403;
    res.statusCode = code;
    res.send({
      code,
      header_title: "Warning",
      message: 'Forbidden'
    })
  }

  static InternalServerError(res, error = null){
    const code = 500;
    const errorMessage = error && process.env.NODE_ENV !== 'production' ? error.message : '';
    res.statusCode = code;
    res.send({
      code,
      header_title: "Error",
      message: 'Internal Server Error ' + errorMessage,
    })
  }
}

module.exports = Response;
