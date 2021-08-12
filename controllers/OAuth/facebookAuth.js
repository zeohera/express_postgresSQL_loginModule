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
    async (accessToken, refreshToken, profile, cb) => {
      // eslint-disable-next-line no-underscore-dangle
      const user = profile._json;
      try {
        const userReturn = await service.saveUserFacebook(user);
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
    const tokenInfo = {
      username: req.user.dataValues.username,
      userId: req.user.dataValues.id,
    };
    const refreshToken = tokenService.generateRefreshToken(tokenInfo);
    const accessToken = tokenService.generateAccessToken(tokenInfo);
    const tokenState = {
      accessToken,
      refreshToken,
      userId: req.user.id,
    };
    await tokenService.postToken(tokenState);
    res.status(200).json(tokenState);
  } catch (error) {
    error.statusCode = 401;
    console.error(error);
    next(error);
  }
};
