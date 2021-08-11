const { Op } = require('sequelize');
const { sequelize, Sequelize } = require('../models');
const UserRole = require('../models/usertorole')(sequelize, Sequelize);

exports.postUserRole = async (userId, role) => {
  try {
    role = parseInt(role, 10);
    const data = await UserRole.create({ userId, roleId: role });
    return data;
  } catch (error) {
    error.message += 'error when create user role';
    throw error;
  }
};

exports.getUserOfRole = async (roleId) => {
  try {
    roleId = parseInt(roleId, 10);
    console.log('roleId', roleId);
    const data = await UserRole.findAll({ attributes: ['userId'], where: { roleId: { [Op.eq]: roleId } } });
    const typeArray = [];
    data.map((item) => (typeArray.push(item.dataValues.userId)));
    return typeArray;
  } catch (error) {
    error.message += ' error when try to get user of role ';
    throw error;
  }
};
