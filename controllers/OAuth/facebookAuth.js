const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('passport');
const url = require('url');

const service = require('../../services/user.service');
const tokenService = require('../../services/token.service');

function fullUrl(req, pathname, queryObj) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname,
    query: queryObj,
  });
}

module.exports.reqOauth = async (req, res, next) => {
  try {
    const callbackSecretUrl = fullUrl(req, 'auth/facebook/secret');
    passport.use(new FacebookStrategy({
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: callbackSecretUrl,
      profileFields: ['id', 'emails', 'name'],
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(`fb token \n${accessToken}`);
      // eslint-disable-next-line no-underscore-dangle
      const user = profile._json;
      try {
        const userReturn = service.saveUserFacebook(user);
        return cb(null, userReturn);
      } catch (error) {
        return cb(error, null);
      }
    }));
    passport.authenticate('facebook');
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
