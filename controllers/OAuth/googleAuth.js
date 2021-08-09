const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const url = require('url');

const tokenService = require('../../services/token.service');
const service = require('../../services/user.service');

function fullUrl(req, pathname, queryObj) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname,
    query: queryObj,
  });
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/secret',
},
(accessToken, refreshToken, profile, cb) => {
  // eslint-disable-next-line no-underscore-dangle
  const user = profile._json;
  console.log(user);
  try {
    const userReturn = service.saveUserGoogle(user);
    return cb(null, userReturn);
  } catch (error) {
    return cb(error, null);
  }
}));

module.exports.reqOauth = async (req, res, next) => {
  try {
    const callbackSecretUrl = fullUrl(req, 'auth/google/secret');
    console.log('check\n\n');
    passport.authenticate('google');
    console.log('check\n\n');
    res.status(100).redirect(callbackSecretUrl);
  } catch (error) {
    error.statusCode = 401;
    console.error(error);
    next(error);
  }
};

module.exports.handleSuccessRes = async (req, res, next) => {
  try {
    req.user.then(async (data) => {
      // console.log('data ne hehe', data);
      const tokenInfo = {
        username: data.dataValues.username,
        userId: data.dataValues.id,
        userPermission: data.dataValues.userPermission,
      };
      const accessToken = tokenService.generateAccessToken(tokenInfo);
      console.log('accessToken', accessToken);
      const refreshToken = tokenService.generateRefreshToken(tokenInfo);
      const tokenState = {
        accessToken,
        refreshToken,
        userId: data.id,
      };
      await tokenService.postToken(tokenState);
      res.status(200).json(tokenState);
    });
  } catch (error) {
    error.statusCode = 401;
    console.error(error);
    next(error);
  }
};
