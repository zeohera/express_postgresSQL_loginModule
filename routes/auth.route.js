var express = require('express');
var router = express.Router();
const controller = require('../controllers/auth.controller')
const { validate } = require('../middlewares/validator/userValidator')
const passportAuthFacebook = require('../middlewares/auth/passportAuthFacebook');
const verityToken = require('../middlewares/auth/isAuth');
const { validateEmail } = require('../middlewares/validator/emailValidator')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;

router.get('/facebook', controller.passportAuthenticate);

router.get('/facebook/secret',passport.authenticate('facebook', { session: false, scope: ['email'] }), controller.facebookLoginSuccess );

router.post('/', controller.login)
router.post('/signup', validate, controller.signup)
router.get('/active', controller.activeAccount)

router.get('/getToken', verityToken, controller.getToken)
router.patch('/logout', verityToken, controller.logout)

router.post('/forgetPassword', validateEmail, controller.sendResetPasswordCode)
router.patch('/forgetPassword/:uuid', controller.resetPassword)

module.exports = router;
