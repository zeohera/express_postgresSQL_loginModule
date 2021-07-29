const { body, validationResult } = require("express-validator");
const { sequelize, Sequelize } = require("../../models");
var User = require("../../models/user")(sequelize, Sequelize);

module.exports.validate = [
  body("username")
    .trim()
    .notEmpty()
    .isAlpha()
    .custom(async (value, { req }) => {
      if (req.method === "POST") {
        var userDoc = await User.findOne({ where: { username: value } });
        if (userDoc) {
          var error = new Error("username already exist.");
          throw error;
        }
      }
    }),
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  body("email")
    .trim()
    .isEmail()
    .custom(async (value, { req }) => {
      if (req.method === "POST") {
        var userDoc = await User.findOne({ where: { email: value } });
        if (userDoc) {
          var error = new Error("email already exist.");
          throw error;
        }
      }
    }),
  body("password").trim().notEmpty().custom(async (value, {req})=>{
    if (value !== req.body.confirmPassword){
      throw new Error("confirm password is not equal with password")
    }
  })
];


