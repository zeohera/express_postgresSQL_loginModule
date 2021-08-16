'use strict';
const { Model } = require('sequelize');
const { role, user } = require('./index');

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
    RoleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: role,
        key: 'id',
      },
    },
    UserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: user,
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'user_role',
  });
  return UserToRole;
};
