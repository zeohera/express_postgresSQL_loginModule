const { sequelize, Sequelize } = require("../models");
var User = require("../models/user")(sequelize, Sequelize);
const { Op } = require("sequelize");
const { validationResult, check } = require("express-validator");
const { checkSecret } = require("./secretCode.service");
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

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

module.exports.randomNumber = (num) => {
  try {
    var pow = Math.pow(10, num);
    console.log(pow / 10, '\n')
    var random = Math.random();
    random = Math.floor(random * pow);
    if (random < (pow / 10)) throw new Error()
    return random;
  } catch (error) {
    this.randomNumber(num)
  }
};

randomUsernameGenerate = async () => {
  try {
    const randNum = this.randomNumber(6)
    const shortName = uniqueNamesGenerator({
      dictionaries: [ colors,animals],
      length: 2,
      style: 'capital',
      separator: ''
    })
    var name = shortName + randNum
    var check = await this.getOneUser(name)
    if (!check) {
      console.log('no found name')
      return name
    } this.randomUsernameGenerate()
  } catch (error) {
    console.error(error)
  }
}

exports.saveUserFacebook = async (data) => {
  try {
    console.log(data)
    var checkEmail = await User.findOne({ where: { email: data.email } })
    var randName = await randomUsernameGenerate()
    if (!checkEmail) {
      let userData = {
        email: data.email,
        username: randName,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        middleName: data.middle_name,
        facebookId: data.id,
        active: true
      }
      var user = User.create(userData)
      return user
    } else {
      var userCheck = await User.findOne({ where: { email: data.email, facebookId: data.id } })
      if (!userCheck){
        var user = await User.update({ facebookId: data.id }, { where: { email: checkEmail.email } })

      }
      var userReturn = await User.findOne({ where: { email: data.email } })
      return userReturn
    }
  } catch (error) {
    console.error(error)
    return [error, null]
  }
}

async function checkLoginActive(info) {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: username }, { email: username }],
      active: true
    },
  });
  return user
}

exports.checkLogin = async (username, iat) => {
  // nếu cung cấp iat thì sẽ ch eck xem token còn hạn hay không , //middleware/isAuth
  // nếu không cung cấp thì sẽ check xem có active hay không //authController
  try {
    if (typeof iat === "number") {
      iat = new Date(iat * 1000);
    }
    if (iat === undefined) {
      iat = Date.now() - 1000000000;
      const user = await checkLoginActive(info);
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
