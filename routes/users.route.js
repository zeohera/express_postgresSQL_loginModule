const express = require('express');

const router = express.Router();
const controller = require('../controllers/user.controller');
const { validate } = require('../middleware/validator/userValidator');
const verifyToken = require('../middleware/auth/isAuth');
const verityToken = require('../middleware/auth/isAuth');
/* GET users listing. */
/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *    schemas:
 *      changePassword:
 *        type: object
 *        properties:
 *          password:
 *            type: string
 *            description: recent password
 *          newPassword:
 *            type: string
 *            description: new password
 *          retypePassword:
 *            type: string
 *            description: retype new password
 *      userInfoUpdate:
 *        type: object
 *        properties:
 *          username:
 *            type: string
 *            description: username
 *          firstName:
 *            type: string
 *            description: tên
 *          middleName:
 *            type: string
 *            description: tên đệm
 *          lastName:
 *            type: string
 *            description: họ
 *      user:
 *        type: object
 *        properties:
 *          id:
 *            type: string
 *            description: id người dùng
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
 *            description: email
 *          avatar:
 *            type: string
 *            description: avatar
 *          billing:
 *            type: boolean
 *            description: trạng thái billing
 *          userPermission:
 *            type: string
 *            description: quyền người dùng
 *          active:
 *            type: boolean
 *            description: trạng thái hoạt động
 *          facebookId:
 *            type: string
 *            description: id facebook người dùng
 */
/**
 * @swagger
 * tags:
 *  name: Users
 *  description: user controller
 */

/**
 * @swagger
 *  /users:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: get all user
 *      tags: [Users]
 *      responses:
 *        500:
 *          description: internal sever error
 *        400:
 *          description: error when get users
 *        200:
 *          description: get all user data
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 */
router.route('/')
  .get(verifyToken, controller.getUsers)
  .post(validate, controller.postUser);
// router.get('/', verifyToken, controller.getUsers);

// need to update combine with admin authorization

/**
 * @swagger
 *  /users/{id}:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: get all user
 *      tags: [Users]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: number
 *      responses:
 *        500:
 *          description: internal sever error
 *        400:
 *          description: error when get users
 *        200:
 *          description: get all user data
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 */
router.get('/:id', verifyToken, controller.getUser);

/**
 * @swagger
 *  /users/{id}:
 *    delete:
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      summary: delete a user
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: number
 *      responses:
 *        400:
 *          description: error when get user
 *        500:
 *          description: internal sever error
 *        200:
 *          description: user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 */
router.delete('/:id', verifyToken, controller.deleteUser);

/**
 * @swagger
 *  /users/{id}:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      summary: update user info
 *      requestBody:
 *       descriptions: info
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userInfoUpdate'
 *      responses:
 *        400:
 *          description: error when get user
 *        500:
 *          description: internal sever error
 *        204:
 *          description: user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 */
router.patch('/:id', validate, verifyToken, controller.updateUser);

/**
 * @swagger
 *  /users/{id}/changePassword:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      summary: change password
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *      requestBody:
 *       descriptions: info
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/changePassword'
 *      responses:
 *        400:
 *          description: error when get user
 *        500:
 *          description: internal sever error
 *        204:
 *          description: user
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/user'
 */
router.patch('/:id/firstPassword', verityToken, controller.addPasswordOauth);
router.patch('/:id/changePassword', verifyToken, controller.changePassword);

module.exports = router;
