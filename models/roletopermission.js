/* eslint-disable */
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class roleToPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  };
  roleToPermission.init({
    permissionId: { type: DataTypes.INTEGER, primaryKey: true },
    roleId: { type: DataTypes.INTEGER, primaryKey: true },
  }, {
    sequelize,
    paranoid: true,
    modelName: 'roleToPermission',
  });
  return roleToPermission;
};