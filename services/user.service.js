const { Op } = require('sequelize');

const {
  uniqueNamesGenerator, colors, animals, NumberDictionary,
} = require('unique-names-generator');

const { sequelize, Sequelize } = require('../models');
const User = require('../models/user')(sequelize, Sequelize);
const userRoleService = require('./userToRole.service');

// const { validationResult, check } = require('express-validator');
// const { checkSecret } = require('./secretCode.service');

exports.getUsers = async (page, limit, type, billing, authType) => {
  try {
    let whereParams = {};
    if (billing !== null) {
      if (billing === 'true') {
        billing = true;
        whereParams.billing = billing;
      } else if (billing === 'false') {
        billing = false;
        whereParams.billing = billing;
      } else {
        throw new Error('wrong params');
      }
    }
    // authType : SSO , 2FA, Default
    if (authType !== 'all') {
      if (authType === 'SSO') {
        const tempParams = {
          where: {
            [Op.or]: [{ facebookId: { [Op.not]: null } }, { googleId: { [Op.not]: null } }],
          },
        };
        whereParams = { ...tempParams.where, ...whereParams };
      }
      if (authType === '2FA') {
        whereParams.twoFactor = true;
      }
      if (authType === 'default') {
        const tempParams = {
          where: { password: { [Op.not]: null } },
        };
        whereParams = { ...tempParams.where, ...whereParams };
      }
    }
    if (type !== null) {
      const typeResult = await userRoleService.getUserOfRole(type);
      const tempParams = {
        where: { id: { [Op.in]: typeResult } },
      };
      whereParams = { ...tempParams.where, ...whereParams };
    }
    const data = await User.findAll({
      limit,
      offset: page,
      attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'avatar', 'billing', 'userPermission', 'active', 'facebookId', 'googleId'],
      where: { ...whereParams },
    });
    return data;
  } catch (error) {
    error.message += '\n error when try to select data';
    throw error;
  }
};

exports.getOneUser = async (data) => {
  try {
    if (typeof data === 'number') {
      data = await User.findOne({
        where: {
          id: data,
        },
      });
    } else {
      data = await User.findOne({
        where: { [Op.or]: [{ username: data }, { email: data }] },
      });
    }
    return data;
  } catch (error) {
    error.message += '\n error when try to find data';
    throw error;
  }
};

exports.postUser = async (data) => {
  try {
    const isExisted = await User.findOne(data);
    if (isExisted) {
      const error = new Error('this user already exist');
      error.statusCode = 422;
    }
    const postedUser = await User.create(data);
    await userRoleService.postUserRole(postedUser.id, 3);
    return postedUser;
  } catch (error) {
    error.statusCode = error.statusCode ? error.statusCode : 500;
    error.message += ' \n error when try to insert data';
    throw error;
  }
};

exports.deleteUser = async (id) => {
  try {
    // eslint-disable-next-line object-shorthand
    const deletedUser = await User.destroy({ where: { id: id } });
    return deletedUser;
  } catch (error) {
    error.statusCode = 500;
    error.message += 'error when try to delete data\n';
    throw error;
  }
};

exports.updateUser = async (param, data) => {
  try {
    if (data.password) {
      data.passwordChangeAt = Sequelize.fn('NOW');
    }
    if (typeof (param) === 'number') {
      await User.update(data, { where: { id: param } });
      return await User.findOne({ where: { id: param } });
    }
    await User.update(data, {
      where: {
        [Op.or]: [{ username: param }, { email: param }],
      },
    });
    return await User.findOne({ where: { [Op.or]: [{ username: param }, { email: param }] } });
  } catch (error) {
    error.statusCode = 500;
    error.message += 'error when try to update data\n';
    throw error;
  }
};

module.exports.randomNumber = (num) => {
  const pow = 10 ** num;
  let random = Math.random();
  random = Math.floor(random * pow);
  if (random < (pow / 10)) {
    this.randomNumber(num);
  }
  return random;
};

module.exports.randomUsernameGenerate = async () => {
  const numberDictionary = NumberDictionary.generate({ min: 100000, max: 999999 });
  const shortName = uniqueNamesGenerator({
    dictionaries: [colors, animals, numberDictionary],
    length: 3,
    style: 'capital',
    separator: '',
  });
  const check = await this.getOneUser(shortName);
  if (check) {
    this.randomUsernameGenerate();
  }
  return shortName;
};

exports.saveUserFacebook = async (data) => {
  try {
    const checkEmail = await User.findOne({ where: { email: data.email } });
    const randName = await this.randomUsernameGenerate();
    if (!checkEmail) {
      const userData = {
        email: data.email,
        username: randName,
        firstName: data.first_name,
        lastName: data.last_name,
        middleName: data.middle_name,
        facebookId: data.id,
        active: true,
      };
      const user = this.postUser(userData);
      return user;
    }
    const userCheck = await User.findOne({ where: { email: data.email, facebookId: data.id } });
    if (!userCheck) {
      await User.update({ facebookId: data.id }, { where: { email: checkEmail.email } });
    }
    const userReturn = await User.findOne({ where: { email: data.email } });
    return userReturn;
  } catch (error) {
    error.message += 'can link facebook account';
    console.error(error);
    return null;
  }
};

exports.saveUserGoogle = async (data) => {
  try {
    const checkEmail = await User.findOne({ where: { email: data.email } });
    const randName = await this.randomUsernameGenerate();
    const familyNameSplit = data.family_name.split(' ');
    if (!checkEmail) {
      const userData = {
        googleId: data.sub,
        email: data.email,
        username: randName,
        firstName: data.given_name,
        lastName: familyNameSplit[0],
        middleName: familyNameSplit[1],
        active: true,
        avatar: data.picture,
      };
      const user = this.postUser(userData);
      return user;
    }
    const userCheck = await User.findOne({ where: { email: data.email, googleId: data.sub } });
    if (!userCheck) {
      await User.update({ googleId: data.sub }, { where: { email: checkEmail.email } });
    }
    const userReturn = await User.findOne({ where: { email: data.email } });
    return userReturn;
  } catch (error) {
    error.message += ', can link facebook account';
    console.error(error);
    return null;
  }
};

async function checkLoginActive(info) {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: info }, { email: info }],
      active: true,
    },
  });
  return user;
}

exports.checkLogin = async (username, iat) => {
  // nếu cung cấp iat thì sẽ check xem token còn hạn hay ko , //middleware/isAuth
  // nếu ko cung cấp thì sẽ check xem có active hay ko //authController
  try {
    if (typeof iat === 'number') {
      iat = new Date(iat * 1000);
    }
    if (iat === undefined) {
      iat = Date.now() - 1000000000;
      const user = await checkLoginActive(username);
      return user;
    }
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
        passwordChangeAt: { [Op.lte]: iat },
      },
    });
    return user;
  } catch (error) {
    error.message += 'error when check login';
    throw error;
  }
};
