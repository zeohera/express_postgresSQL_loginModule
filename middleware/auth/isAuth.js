const jwt = require('jsonwebtoken');

const userService = require('../../services/user.service');
const tokenService = require('../../services/token.service');

const verityToken = async (req, res, next) => {
  try {
    let token;
    if (!req.headers.authorization) {
      token = req.query.refreshToken || req.body.refreshToken;
      if (!token) {
        const err = new Error('token not found');
        err.statusCode = 401;
        throw err;
      }
    } else {
      // eslint-disable-next-line prefer-destructuring
      token = req.headers.authorization.split(' ')[1];
    }
    const tokenState = await tokenService.getTokenState(token);
    if (tokenState === null) {
      const err = new Error('Wrong token');
      err.statusCode = 401;
      throw err;
    }
    if (tokenState === false) {
      const err = new Error('token invalid by logout');
      err.statusCode = 401;
      throw err;
    }
    let decoded;
    let isRefresh = 0;
    try {
      decoded = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    } catch (error) {
      decoded = null;
    }
    if (decoded === null) {
      decoded = await jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
      isRefresh = 1;
    }
    if (!decoded) {
      const err = new Error('Wrong token');
      err.statusCode = 401;
      throw err;
    }
    const { username, iat } = decoded;
    const user = await userService.checkLogin(username, iat);
    if (user === null) {
      const error = new Error('token out of date');
      error.statusCode = 401;
      throw error;
    }
    req.decodedJWT = decoded;
    req.decodedJWT.isRefresh = isRefresh;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

module.exports = verityToken;
