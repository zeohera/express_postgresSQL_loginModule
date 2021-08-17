const { sequelize, Sequelize } = require('../models');
const Role = require('../models/role')(sequelize, Sequelize);

module.exports.getAllRole = async () => {
  try {
    const data = await Role.findAll();
    return data;
  } catch (error) {
    error.message += ' error when try to get all role';
    throw error;
  }
};
