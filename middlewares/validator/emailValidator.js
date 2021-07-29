const { body, validationResult } = require("express-validator");

module.exports.validateEmail = [
    body("email").trim().isEmail()
]