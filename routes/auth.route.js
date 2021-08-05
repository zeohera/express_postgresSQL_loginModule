var express = require('express');
var router = express.Router();
const controller = require('../controllers/auth.controller')
const { validate } = require('../middlewares/validator/userValidator')
const passportAuthFacebook = require('../middlewares/auth/passportAuthFacebook');
const verityToken = require('../middlewares/auth/isAuth');
const { validateEmail } = require('../middlewares/validator/emailValidator')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;

/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 * 
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
 *      
 *      accessTokenScheme:
 *        type: object
 *        properties:
 *          access Token:
 *            type: string
 *            description: access token
 *      
 *      refreshTokenScheme:
 *        type: object
 *        properties:
 *          refreshToken:
 *            type: string
 *            description: refresh token
 * 
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
 * 
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
 *            description: tên đăng nhập
 *          firstName:
 *            type: string
 *            description: tên
 *          middleName:
 *            type: string
 *            description: tên đệm 
 *          lastName:
 *            type: string
 *            description: họ
 *          email:
 *            type: string
 *            description: địa chỉ email
 *          password:
 *            type: string
 *            description: mật khẩu
 *        example:
 *            username: haha
 *            firstName: Bảo
 *            middleName: Chí
 *            lastName: Bùi
 *            gmail : buichibao1011@gmail.com
 *            password : '111'   
 */

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: authenticate and authorization user
 */

router.get('/facebook', controller.passportAuthenticate);
router.get('/facebook/secret', passport.authenticate('facebook', { session: false, scope: ['email'] }), controller.facebookLoginSuccess);

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
 *          description: wrong username or password
 */
router.post('/', controller.login)

/**
 * @swagger
 *  /auth/signup: 
 *    post: 
 *      summary: Login
 *      tags: [Auth]
 *      requestBody:
 *          descriptions: Sign up an user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/userInfoSignup'
 *      responses:
 *        202:
 *          description: data saved
 *        422:
 *          description: Validation failed.
 */
router.post('/signup', validate, controller.signup)

/**
 * @swagger 
 *  /auth/active:
 *    patch:
 *      tags: [Auth]
 *      summary: active account when signup with user and password
 *      parameters:
 *        - in: path
 *          name: hash 
 *          required: true
 *          schema:
 *            type: string
 *        - in: path
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
router.patch('/active', controller.activeAccount)

// *      requestBody:
// *        descriptions: refreshToken 
// *        content:
// *          application/json:
// *            schema:
// *              $ref: '#/components/schemas/refreshTokenScheme'
// *                $ref: '#/components/schemas/accessTokenScheme'


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
 *          description: wrong token 
 */
router.get('/getToken', verityToken, controller.getToken)

/**
 * @swagger
 *  /auth/logout:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags: [Auth]
 *      summary: logout user
 *      responses:
 *        204:
 *          description: logout
 *        500:
 *          description: local sever error
 */
router.patch('/logout', verityToken, controller.logout)

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
 */
router.post('/forgetPassword', validateEmail, controller.sendResetPasswordCode)

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
 *
 */
router.patch('/forgetPassword/:uuid', controller.resetPassword)

router.get('/forgetPassword/:uuid', (req, res) => {res.send('hello')})
module.exports = router;
