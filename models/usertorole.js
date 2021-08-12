'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserToRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  UserToRole.init({
    RoleId: { type: DataTypes.INTEGER, primaryKey: true },
    UserId: { type: DataTypes.INTEGER, primaryKey: true },
  }, {
    sequelize,
    modelName: 'UserToRoles',
  });
  return UserToRole;
};
