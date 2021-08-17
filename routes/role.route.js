const express = require('express');

const router = express.Router();
const controller = require('../controllers/role.controller');
const verifyToken = require('../middleware/auth/isAuth');
/**
 * @swagger
 * tags:
 *  name: Role
 *  description: user controller
*/
/**
 * @swagger
 *  /roles:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: get all role
 *      tags: [Role]
 *      responses:
 *        500:
 *          description: internal sever error
 *        400:
 *          description: error when get users
 *        200:
 *          description: get all user data
 */
router.get('/', verifyToken, controller.getAllRole);
module.exports = router;
