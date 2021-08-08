const passport = require('passport');
// eslint-disable-next-line no-unused-vars
const FacebookStrategy = require('passport-facebook').Strategy;

const passportAuthFacebook = (req, res, next) => {
    passport.authenticate('facebook', { session: false, scope: [ 'email'] })
}

module.exports = passportAuthFacebook;