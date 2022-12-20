const jwt = require('jsonwebtoken');
const sequelize = require('../configs/sequelize');

async function optionalAuthMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next();
  }

  // Check token existed.
  // Sometime front end send authorization with empty token - E.g: 'Bearer '
  const [,token] = authorization.split(' ');
  if (!token) {
    return next();
  }

  return authMiddleware(req, res, next);
}

async function queryAuthMiddleware(req, res, next){
  const {authorization} = req.query;
  if (authorization) {
    const jwtToken = authorization.split(' ')[1];
    
    if (jwtToken) {
      try {
        jwt.verify(jwtToken, process.env.JWT_SECRET || 'secret');
        
        const decodedData = jwt.decode(jwtToken);
        req.jwt = decodedData;
        const user = await sequelize.models.users.findOne({
          attributes: {
            exclude: ['password']
          },
          where: {
            id: decodedData.user.id,
            email: decodedData.user.email
          },
          include: [
            'role',
            {
              model: sequelize.models.merchants,
              as: 'merchants',
              include: ['merchant_industry']
            },
            // 'merchants'
          ]
        });

        if (!user) {
          return BaseResponse.BadResponse(res, 'User not found');
        }
        
        req.user = user;
        next();
      } catch (error) {
        return BaseResponse.BadResponse(res, error.message);
      }
    } else {
      return BaseResponse.Unauthorized(res);
    }
  } else {
    return BaseResponse.Unauthorized(res);
  }
}

async function authMiddleware(req, res, next) {
  const {authorization} = req.headers;
  if (authorization) {
    const jwtToken = authorization.split(' ')[1];

    if (jwtToken) {
      try {
        jwt.verify(jwtToken, process.env.JWT_SECRET || 'secret');

        const decodedData = jwt.decode(jwtToken);
        req.jwt = decodedData;
        const user = await sequelize.models.users.findOne({
          attributes: {
            exclude: ['password']
          },
          where: {
            id: decodedData.user.id,
            email: decodedData.user.email
          },
          include: [
            'role',
            {
              model: sequelize.models.merchants,
              as: 'merchants',
              include: ['merchant_industry']
            },
            // 'merchants'
          ]
        });

        if (!user) {
          return BaseResponse.BadResponse(res, 'User not found');
        }

        req.user = user;
        next();
      } catch (error) {
        return BaseResponse.BadResponse(res, error.message);
      }
    } else {
      return BaseResponse.Unauthorized(res);
    }
  } else {
    return BaseResponse.Unauthorized(res);
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (user && roles.includes(user.role.name)) {
      next();
    } else {
      BaseResponse.Forbidden(res);
    }
  }
}


module.exports = {
  authMiddleware,
  roleMiddleware,
  optionalAuthMiddleware,
  queryAuthMiddleware
}
