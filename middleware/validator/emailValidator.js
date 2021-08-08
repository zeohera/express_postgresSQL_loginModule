const { body } = require('express-validator');

module.exports.validateEmail = [
  body('email').trim().isEmail(),
];
