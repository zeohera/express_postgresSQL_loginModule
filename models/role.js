/* eslint-disable */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.role.belongsToMany(models.user, {
        through: 'user_role', foreignKey: 'RoleId', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'role_as'
      });
    }
  }
  Role.init({
    name: { type: DataTypes.STRING, unique: true },
    description: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'role',
    timestamps: false,
  });
  return Role;
};
