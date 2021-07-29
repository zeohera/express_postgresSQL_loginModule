const { sequelize, Sequelize } = require("../models");
var User = require("../models/user")(sequelize, Sequelize);
const { Op } = require("sequelize");
const { validationResult, check } = require("express-validator");

exports.getUsers = async (page, limit) => {
  try {
    var data = await User.findAll({ limit: limit, offset: page });
    return data;
  } catch (error) {
    error.statusCode = 500;
    error.message = "error when try to select data\n" + error.message;
    throw error;
  }
};

exports.getOneUser = async (data) => {
  try {
    if (typeof data === "number") {
      data = await User.findOne({
        where: {
          id: data,
        },
      });
    } else data = await User.findOne({
      where: {
        [Op.or]: [{ username: data }, { email: data }],
      }
    })

    return data;
  } catch (error) {
    error.statusCode = 500;
    error.message = "error when try to find data\n" + error.message;
    throw error;
  }
};

exports.postUser = async (data) => {
  try {
    const postedUser = await User.create(data);
    return postedUser;
  } catch (error) {
    error.statusCode = 500;
    error.message = "error when try to insert data\n" + error.message;
    throw error;
  }
};

exports.deleteUser = async (id) => {
  try {
    const deletedUser = await User.destroy({ where: { id: id } });
    return deletedUser;
  } catch (error) {
    error.statusCode = 500;
    error.message = "error when try to delete data\n" + error.message;
    throw error;
  }
};

exports.updateUser = async (param, data) => {
  try {
    if (data.password) {
      data.passwordChangeAt = Sequelize.fn("NOW");
    }
    if (typeof (param) === 'number') {
      const user = await User.update(data, { where: { id: param } });
      return user;
    } else {
      const user = await User.update(data, {
        where: {
          [Op.or]: [{ username: param }, { email: param }],
        }
      })
      return user;
    }

  } catch (error) {
    error.statusCode = 500;
    error.message = "error when try to update data\n" + error.message;
    throw error;
  }
};

exports.checkLogin = async (username, iat) => {
  // nếu cung cấp iat thì sẽ ch eck xem token còn hạn hay không , //middleware/isAuth
  // nếu không cung cấp thì sẽ check xem có active hay không //authController
  try {
    if (typeof iat === "number") {
      iat = new Date(iat * 1000);
    }
    if (iat === undefined) {
      iat = Date.now() - 1000000000;
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username: username }, { email: username }],
          active: true
        },
      });
      return user;
    } else {
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username: username }, { email: username }],
          passwordChangeAt: { [Op.lte]: iat },
        },
      });
      console.log(user);
      return user;
    }
  } catch (error) {
    throw error;
  }
};
