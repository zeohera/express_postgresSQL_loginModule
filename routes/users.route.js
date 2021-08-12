const express = require('express');

const router = express.Router();
const controller = require('../controllers/user.controller');
const { validate } = require('../middleware/validator/userValidator');
const verifyToken = require('../middleware/auth/isAuth');
const ownerCheck = require('../middleware/auth/owner');
/* GET users listing. */
/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *    schemas:
 *      firstTimeChangePassword:
 *        type: object
 *        properties:
 *          password:
 *            type: string
 *            description: recent password
 *          retypePassword:
 *            type: string
 *            description: retype new password
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
 *          googleId:
 *            type: string
 *            description: id google người dùng
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
 *      parameters:
 *        - in: query
 *          name: page
 *          schema:
 *            type: number
 *        - in: query
 *          name: limit
 *          schema:
 *            type: number
 *        - in: query
 *          name: type
 *          schema:
 *            type: number
 *        - in: query
 *          name: billing
 *          schema:
 *            type: boolean
 *        - in: query
 *          name: authType
 *          schema:
 *            type: string
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
 *          description: user deleted
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
router.route('/:id')
  .all(verifyToken)
  .get(controller.getUser)
  .delete(controller.deleteUser)
  .patch(validate, controller.updateUser);

/**
 * @swagger
 *  /users/{id}/firstPassword:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      tags: [Users]
 *      summary: change password for the firs time in forever
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
 *             $ref: '#/components/schemas/firstTimeChangePassword'
 *      responses:
 *        400:
 *          description: error when get user
 *        500:
 *          description: internal sever error
 *        200:
 *          description: password added
 */
router.patch('/:id/firstPassword', verifyToken, ownerCheck, controller.addPasswordOauth);

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
router.patch('/:id/changePassword', verifyToken, ownerCheck, controller.changePassword);

module.exports = router;
