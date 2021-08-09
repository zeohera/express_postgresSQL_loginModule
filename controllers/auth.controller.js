const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const url = require('url');
const { validationResult } = require('express-validator');

const service = require('../services/user.service');
const tokenService = require('../services/token.service');
const secretService = require('../services/secretCode.service');
const { sendEmail } = require('../utils/sendEmail');

function fullUrl(req, pathname, queryObj) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname,
    query: queryObj,
  });
}

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username == null || undefined) {
      const error = new Error('username not found');
      error.statusCode = 401;
      next(error);
    }
    if (password == null || undefined) {
      const error = new Error('password not found');
      error.statusCode = 401;
      next(error);
    }
    const data = await service.checkLogin(username);
    if (!data) {
      const error = new Error('wrong user name or password');
      error.statusCode = 404;
      throw error;
    }
    bcrypt.compare(req.body.password, data.password, async (err, result) => {
      if (err) {
        const error3 = new Error('login failed, you may want to change login method');
        error3.statusCode = 401;
        next(error3);
      }
      if (result === false) {
        const error2 = new Error('login failed');
        error2.statusCode = 401;
        next(error2);
      } else {
        const tokenInfo = {
          username: data.username,
          userId: data.id,
          userPermission: data.userPermission,
        };
        const accessToken = tokenService.generateAccessToken(tokenInfo);
        const refreshToken = tokenService.generateRefreshToken(tokenInfo);
        const tokenState = {
          accessToken,
          refreshToken,
          userId: data.id,
        };
        await tokenService.postToken(tokenState);
        res.status(201).json(tokenState);
      }
    });
  } catch (err) {
    err.message = err.message ? err.message : 'error when get users';
    err.statusCode = err.statusCode ? err.statusCode : 400;
    next(err);
  }
};

module.exports.signup = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    const {
      username,
      firstName,
      lastName,
      email,
      password,
    } = req.body;
    const data = {
      username,
      password,
      firstName,
      lastName,
      email,
      billing: 1,
    };
    bcrypt.hash(data.password, 12, async (err, hash) => {
      data.password = hash;
      const serviceResult = await service.postUser(data);
      const emailHash = await bcrypt.hash(data.email, 12);
      const linkActive = fullUrl(req, 'auth/active', { hash: emailHash, userId: serviceResult.id });
      const dataSend = {
        heading: 'Kích hoạt tài khoản',
        content: 'Bấn vào đường link để kích hoạt tài khoản',
        link: linkActive,
      };
      await sendEmail(
        data.email,
        'Kích hoạt tài khoản',
        dataSend,
      );
      res.status(202).json({ message: 'data saved, click the link to active account', link: linkActive });
    });
  } catch (error) {
    next(error);
  }
};

module.exports.activeAccount = async (req, res, next) => {
  try {
    const userId = parseInt(req.query.userId, 10);
    const emailHash = req.query.hash;
    const user = await service.getOneUser(userId);
    if (!user) {
      const error = new Error('user not found');
      error.statusCode = 404;
    }
    const bcryptCompareResult = await bcrypt.compare(user.email, emailHash);
    if (bcryptCompareResult === false) {
      const error = new Error('wrong email');
      error.statusCode = 404;
      throw error;
    }
    await service.updateUser(userId, { active: true });
    res.status(200).json({ message: 'account activated' });
  } catch (error) {
    next(error);
  }
};

module.exports.getToken = async (req, res, next) => {
  try {
    const { decodedJWT } = req;
    if (decodedJWT.isRefresh === 0) {
      const error = new Error('you need provide Refresh Token !');
      error.statusCode = 401;
      throw error;
    }
    const refreshToken = req.query.refreshToken || req.headers.authorization.split(' ')[1];
    let result = await tokenService.checkToken(decodedJWT.userId, refreshToken);
    if (result === null) {
      result = await tokenService.generateAccessTokenSave(
        {
          userId: decodedJWT.userId,
          username: decodedJWT.username,
          userPermission: decodedJWT.userPermission,
        },
        refreshToken,
      );
    }
    res.status(200).json({ accessToken: result });
  } catch (error1) {
    console.error(error1);
    next(error1);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    let key;
    if (req.decodedJWT.isRefresh === 1) {
      key = process.env.JWT_REFRESH_TOKEN;
    } else key = process.env.JWT_ACCESS_TOKEN;
    const decode = jwt.verify(token, key);
    if (decode) {
      await tokenService.invalidToken(token);
      res.status(204).json({ message: 'logout' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports.sendResetPasswordCode = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error('Validate failed.');
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    const { email } = req.body;
    const user = await service.getOneUser(email);

    if (user === null) {
      const error = new Error('Email is not exist');
      error.statusCode = 404;
      throw error;
    }
    const secretCode = service.randomNumber(6);
    const secretCodeUUID = await secretService.postSecret({ email, secretCode });
    const fullLink = fullUrl(req, `auth/forgetPassword/ ${secretCodeUUID} `, { secretCode });
    const dataSend = {
      heading: 'Nhập mật mã sau để xác định danh tính',
      content: secretCode,
      message:
        'mã này có thời hạn 5 phút , dùng trước khi hết hạn hoặc được cung cấp mã khác',
      link: fullLink,
    };
    await sendEmail(
      email,
      'Đặt lại mật khẩu',
      dataSend,
    );
    res.status(202).json({
      message: `reset code sended to ${email}, please check inbox`,
      link: fullUrl(req, `${fullLink}`),
    });
  } catch (error) {
    next(error);
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { retypePassword, newPassword } = req.body;
    const { uuid } = req.params;
    if (!uuid) {
      const error = new Error('uuid not found');
      error.statusCode = 404;
      throw error;
    }
    const secret = req.query.secretCode || req.body.secretCode || null;
    const secretServiceResult = await secretService.checkSecret(secret, uuid);
    if (!secretServiceResult) {
      const error = new Error('wrong link or wrong secret code');
      error.statusCode = 422;
      throw error;
    }
    if (newPassword.localeCompare(retypePassword) !== 0) {
      const error = new Error('password not match');
      error.statusCode = 422;
      throw error;
    }
    const hash = await bcrypt.hash(newPassword, 12);
    const updatePasswordResult = service.updateUser(secretServiceResult.email, { password: hash });
    tokenService.invalidTokenById(updatePasswordResult.id);
    if (!updatePasswordResult) {
      const error = new Error('cant change password');
      throw error;
    }
    res.status(204).json({ message: 'your password reset success full', data: updatePasswordResult });
  } catch (error) {
    next(error);
  }
};
