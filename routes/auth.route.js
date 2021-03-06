const express = require('express');
const passport = require('passport');

const router = express.Router();
const controller = require('../controllers/auth.controller');
const googleAuthController = require('../controllers/OAuth/googleAuth');
const facebookAuthController = require('../controllers/OAuth/facebookAuth');
const { validate } = require('../middleware/validator/userValidator');
const verityToken = require('../middleware/auth/isAuth');
const { validateEmail } = require('../middleware/validator/emailValidator');
/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *    schemas:
 *      auth:
 *        type: object
 *        required:
 *          -username
 *          -password
 *        properties:
 *          username:
 *            type: string
 *            description: username or email
 *          password:
 *            description: password
 *            type: string
 *        example:
 *            username : buichibao1011@gmail.com
 *            password : '111'
 *      accessTokenScheme:
 *        type: object
 *        properties:
 *          access Token:
 *            type: string
 *            description: access token
 *      refreshTokenScheme:
 *        type: object
 *        properties:
 *          refreshToken:
 *            type: string
 *            description: refresh token
 *      loginResponse:
 *        type: object
 *        required:
 *          - accessToken
 *          - refreshToken
 *        properties:
 *          accessToken:
 *            type: string
 *            description: access token
 *          refreshToken:
 *            type: string
 *            description: refresh token
 *          userId:
 *            type: number
 *          state:
 *            type: number
 *      userInfoSignupValidateFailed:
 *        type: object
 *        properties:
 *          message:
 *             type: string
 *          data:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *                msg:
 *                  type: string
 *                param:
 *                  type: string
 *                location:
 *                  type: string
 *      userInfoSignup:
 *        type : object
 *        required:
 *          - username
 *          - firstName
 *          - middleName
 *          - lastName
 *          - email
 *          - password
 *        properties:
 *          username:
 *            type: string
 *            description: t??n ????ng nh???p
 *          firstName:
 *            type: string
 *            description: t??n
 *          middleName:
 *            type: string
 *            description: t??n ?????m
 *          lastName:
 *            type: string
 *            description: h???
 *          email:
 *            type: string
 *            description: ?????a ch??? email
 *          password:
 *            type: string
 *            description: m???t kh???u
 *        example:
 *            username: haha
 *            firstName: B???o
 *            middleName: Ch??
 *            lastName: B??i
 *            email : buichibao1011@gmail.com
 *            password : '111'
 *            confirmPassword : '111'
 */

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: authenticate and authorization user
 */

router.get('/facebook', facebookAuthController.reqOauth);
router.get('/facebook/secret', passport.authenticate('facebook', { session: false, scope: ['email'] }), facebookAuthController.handleSuccessRes);

router.get('/google', googleAuthController.reqOauth);
router.get('/google/secret', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }), googleAuthController.handleSuccessRes);

/**
 * @swagger
 *  /auth:
 *    post:
 *      summary: Login
 *      tags: [Auth]
 *      requestBody:
 *          descriptions: Login user by email and password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/auth'
 *      responses:
 *        201:
 *          description: save these token
 *          contents:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/loginResponse'
 *        401:
 *          description: username and password is wrong
 *        500:
 *          description: sever error
 */
router.post('/', controller.login);

/**
 * @swagger
 *  /auth/signup:
 *    post:
 *      summary: Sign up
 *      tags: [Auth]
 *      requestBody:
 *          descriptions: Sign up an user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/userInfoSignup'
 *      responses:
 *        500:
 *          description: sever error
 *        202:
 *          description: data saved
 *        422:
 *          description: Validation failed.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/userInfoSignupValidateFailed'
 */
router.post('/signup', validate, controller.signup);

/**
 * @swagger
 *  /auth/active:
 *    patch:
 *      tags: [Auth]
 *      summary: active account when signup with user and password
 *      parameters:
 *        - in: query
 *          name: hash
 *          required: true
 *          schema:
 *            type: string
 *        - in: query
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: account activated
 *        404:
 *          description: user not found or wrong email
 */
router.patch('/active', controller.activeAccount);
router.post('/active', controller.activeAccount);
router.get('/active', controller.activeAccount);

/**
 * @swagger
 *  /auth/getToken:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary : return access token
 *      tags: [Auth]
 *      responses:
 *        200:
 *          description: valid access token
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  accessToken:
 *                    type: string
 *        401:
 *          description: you need to provide refresh token
 *        500:
 *          description: sever error
 */
router.get('/getToken', verityToken, controller.getToken);

/**
 * @swagger
 *  /auth/logout:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags: [Auth]
 *      summary: logout user
 *      responses:
 *        205:
 *          description: logout successful
 *        500:
 *          description: sever error
 */
router.patch('/logout', verityToken, controller.logout);

/**
 * @swagger
 * /auth/forgetPassword:
 *  post:
 *      tags: [Auth]
 *      summary: sendEmail to reset password
 *      requestBody:
 *        descriptions: Email
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *      responses:
 *        422:
 *          description: validate failed
 *        404:
 *          description: email is not exist
 *        202:
 *          description: email sended
 *        500:
 *          description: sever error
 */
router.post('/forgetPassword', validateEmail, controller.sendResetPasswordCode);

/**
 * @swagger
 * /auth/forgetPassword/{uuid}:
 *  patch:
 *    tags: [Auth]
 *    summary: reset password when user forget it
 *    parameters:
 *      - in: path
 *        name: uuid
 *        required: true
 *        schema:
 *          type: string
 *    requestBody:
 *      descriptions: info
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              secretCode:
 *                type: string
 *              newPassword:
 *                type: string
 *              retypePassword:
 *                type: string
 *    responses:
 *      400:
 *        description: uuid not found
 *      401:
 *        description: wrong link or wrong secret code
 *      422:
 *        description: password and retypePassword not match
 *      204:
 *        description:your password reset success full
 *      500:
 *        description: sever error
 */
router.patch('/forgetPassword/:uuid', controller.resetPassword);

router.get('/forgetPassword/:uuid', (req, res) => { res.send('hello'); });
module.exports = router;
