
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport')
const { validationResult } = require("express-validator");
const service = require("../services/user.service");
const tokenService = require("../services/token.service");
const secretService = require("../services/secretCode.service");
const sendEmail = require("../utils/sendEmail").sendEmail;
const { options } = require("../routes");
var url = require('url');

function fullUrl(req, pathname, queryObj) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: pathname,
    query: queryObj
  });
}

module.exports.passportAuthenticate = async (req, res, next) => {
  try {
    const callbackSecretUrl = fullUrl(req, 'auth/facebook/secret')
    passport.use(new FacebookStrategy({
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: callbackSecretUrl,
      profileFields: ['id', 'emails', 'name']
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(`fb token \n${accessToken}`)
        var user = profile._json;
        var err, user = service.saveUserFacebook(user);
        console.log(user)
        return cb(err, user);
    }));
    passport.authenticate('facebook')
    res.status(100).redirect(callbackSecretUrl)
  } catch (error) {
    error.statusCode = 401
    console.error(error)
    next(error)
  }
}

module.exports.facebookLoginSuccess = async (req, res, next) => {
  try {
    req.user.then(async (data) => {
      const tokenInfo = {
        username: data.username,
        userId: data.id,
        userPermission: data.userPermission,
      };
      const accessToken = tokenService.generateAccessToken(tokenInfo);
      const refreshToken = tokenService.generateRefreshToken(tokenInfo);
      const tokenState = {
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: data.id,
      }; 
      await tokenService.postToken(tokenState);
      res.status(200).json(tokenState);
    })
  } catch (error) {
    error.statusCode = 401
    console.error(error)
    next(error)
  }
}

module.exports.login = async (req, res, next) => {
  try {
    var username = req.body.username || req.body.password;
    if (username == null || undefined) {
      var error = new Error("username not found");
      error.statusCode = 401;
      throw error;
    }
    var data = await service.checkLogin(username);
    bcrypt.compare(req.body.password, data.password, async (err, result) => {
      if (result === false) {
        var error2 = new Error("login failed");
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
          accessToken: accessToken,
          refreshToken: refreshToken,
          userId: data.id,
        };
        await tokenService.postToken(tokenState);
        res.status(201).json(tokenState);
      }
    });
  } catch (err) {
    err.message = err.message ? err.message : "error when get users";
    err.statusCode = err.statusCode ? err.statusCode : 400;
    next(err);
  }
};

module.exports.signup = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    let { username, firstName, lastName, email, password } = req.body;
    var data = {
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
      const emailHash = await bcrypt.hash(data.email, 12)
      const linkActive = fullUrl(req, `auth/active`, { hash: emailHash, userId: serviceResult.id })
      var dataSend = {
        heading: "Kích hoạt tài khoản",
        content: "Bấn vào đường link để kích hoạt tài khoản",
        link: linkActive
      };
      await sendEmail(
        data.email,
        "Kích hoạt tài khoản",
        dataSend
      );
      res.status(202).json({ message: "data saved, click the link to active account", link: linkActive });
    });
  } catch (error) {
    next(error);
  }
};

module.exports.activeAccount = async (req, res, next) => {
  try {
    const userId = parseInt(req.query.userId)
    const emailHash = req.query.hash
    var user = await service.getOneUser(userId)
    if (!user) {
      var error = new Error('user not found')
      error.statusCode=404
    }
    var bcryptCompareResult = await bcrypt.compare(user.email, emailHash)
    if (bcryptCompareResult === false) {
      var error = new Error("wrong email");
      throw error
    }
    await service.updateUser(userId, { active: true })
    res.status(200).json({ message: 'account activated' })
  } catch (error) {
    next(error)
  }
}

module.exports.getToken = async (req, res, next) => {
  try {
    const decodedJWT = req.decodedJWT;
    if (decodedJWT.isRefresh === 0) {
      var error = new Error("you need provide Refresh Token !");
      error.statusCode = 418
      throw error;
    }
    const refreshToken = req.headers.authorization.split(" ")[1];
    let result = await tokenService.checkToken(decodedJWT.userId, refreshToken);
    if (result === null) {
      result = await tokenService.generateAccessTokenSave(
        {
          userId: decodedJWT.userId,
          username: decodedJWT.username,
          userPermission: decodedJWT.userPermission,
        },
        refreshToken
      );
    }
    res.status(205).json({ accessToken: result });
  } catch (error) {
    console.error(error)
    next(error);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    let key;
    if (req.decodedJWT.isRefresh === 1) {
      key = process.env.JWT_REFRESH_TOKEN;
    } else key = process.env.JWT_ACCESS_TOKEN;
    var decode = jwt.verify(token, key);
    if (decode) {
      await tokenService.invalidToken(token);
      res.status(205).json({ message: "logout" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports.randomNumber = (num) => {
  try {
    var pow = Math.pow(10, num);
    console.log(pow / 10, '\n')
    var random = Math.random();
    random = Math.floor(random * pow);
    if (random < (pow / 10)) throw new Error()
    return random;
  } catch (error) {
    this.randomNumber(num)
  }
};

module.exports.sendResetPasswordCode = async (req, res, next) => {
  try {
    const result = validationResult(req);
    console.log('result', result)
    if (!result.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = result.errors;
      throw error;
    }
    const email = req.body.email
    var user = await service.getOneUser(email);

    if (user === null) {
      const error =  new Error("Email is not exist")
      error.statusCode = 404
      throw error
    }
    const secretCode = this.randomNumber(6);
    var secretCodeUUID = await secretService.postSecret({ email: email, secretCode: secretCode })
    var dataSend = {
      heading: "Nhập mật mã sau để xác định danh tính",
      content: secretCode,
      message:
        "mã này có thời hạn 5 phút , dùng trước khi hết hạn hoặc được cung cấp mã khác",
      link: fullUrl(req, `auth/forgetPassword/resetPassword/${secretCodeUUID}`, { secretCode: secretCode })
    };
    await sendEmail(
      email,
      "Đặt lại mật khẩu",
      dataSend
    );
    res.status(202).json({ message: `reset code sended to ${email}, plese check inbox`, link: fullUrl(req, `auth/forgetPassword/resetPassword/${secretCodeUUID}`) });
  } catch (error) {
    next(error);
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const retypePassword = req.body.retypePassword;
    const newPassword = req.body.newPassword;
    const uuid = req.params.uuid;
    if (!uuid) {
      var error = new Error("uuid not found");
      error.statusCode = 404;
      throw error;
    }
    const secret = req.query.secretCode || req.body.secretCode || null;
    const secretServiceResult = await secretService.checkSecret(secret, uuid);
    if (!secretServiceResult) {
      var error = new Error("wrong link or wrong secret code");
      error.statusCode = 422;
      throw error;
    }

    if (newPassword.localeCompare(retypePassword) !== 0) { 
      var error = new Error("password not match");
      error.statusCode = 422
      throw error;
    }
    const hash = await bcrypt.hash(newPassword, 12);
    var userUpdatePasswordResult = service.updateUser(secretServiceResult.email, { password: hash })
    if (!userUpdatePasswordResult) {
      var error = new Error('cant change password')

    }
    res.status(204).json({ message: 'your password reset success full', data: userUpdatePasswordResult })
  } catch (error) {
    next(error)
  }
}
