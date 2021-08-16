const { Op } = require('sequelize');
const db = require('../models');

const UserRole = db.sequelize.models.user_role;

exports.postUserRole = async (UserId, role) => {
  try {
    role = parseInt(role, 10);
    const dataBefore = await UserRole.findOne({ where: { UserId, RoleId: role } });
    if (dataBefore) return dataBefore;
    const data = await UserRole.create({ UserId, RoleId: role });
    return data;
  } catch (error) {
    error.message += ' - error when create user role';
    throw error;
  }
};

exports.getUserOfRole = async (RoleId) => {
  try {
    RoleId = parseInt(RoleId, 10);
    const data = await UserRole.findAll({ attributes: ['UserId'], where: { RoleId: { [Op.eq]: RoleId } } });
    const typeArray = [];
    data.map((item) => (typeArray.push(item.dataValues.UserId)));
    return typeArray;
  } catch (error) {
    error.message += ' error when try to get user of role ';
    throw error;
  }
};

exports.deleteRole = async (UserId, RoleId) => {
  try {
    if (RoleId) {
      const result = await UserRole.destroy({ where: { UserId, RoleId } });
      return result;
    }
    const result = await UserRole.destroy({ where: { UserId } });
    return result;
  } catch (error) {
    error.message += ' - error when try to delete role';
    throw error;
  }
};
