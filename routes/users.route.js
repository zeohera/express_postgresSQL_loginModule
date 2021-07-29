
var express = require('express');
var router = express.Router();
const controller = require('../controllers/user.controller')
const {validate} = require('../middlewares/validator/userValidator')

const verityToken = require('../middlewares/auth/isAuth');
/* GET users listing. */

router.get('/' ,verityToken, controller.getUsers)
router.get('/:id' , controller.getUser)
router.post('/', validate ,controller.postUser)
router.delete('/:id', controller.deleteUser)
router.patch('/changePassword', verityToken, controller.changePassword)
router.patch('/:id', validate, controller.updateUser)

module.exports = router;
