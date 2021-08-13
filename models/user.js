/* eslint-disable no-unused-vars */
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.User.belongsToMany(models.Role, {
        through: 'UserToRoles', foreignKey: 'UserId', onDelete: 'CASCADE', onUpdate: 'CASCADE',
      });
    }
  }
  User.init(
    {
      username: { type: DataTypes.STRING, require: true },
      password: { type: DataTypes.STRING, require: true },
      firstName: { type: DataTypes.STRING, require: true },
      middleName: { type: DataTypes.STRING, require: true },
      lastName: { type: DataTypes.STRING, require: true },
      email: { type: DataTypes.STRING, require: true },
      avatar: { type: DataTypes.STRING, require: false },
      billing: { type: DataTypes.BOOLEAN, require: true, defaultValue: true },
      userPermission: { type: DataTypes.STRING, require: true },
      passwordChangeAt: { type: DataTypes.DATE, require: false, defaultValue: DataTypes.NOW },
      active: { type: DataTypes.BOOLEAN, require: true, defaultValue: false },
      facebookId: { type: DataTypes.STRING, require: false },
      googleId: { type: DataTypes.STRING, require: false },
    },
    {
      hooks: {
        beforeCreate: (user, options) => {
          user.dataValues.createdAt = Math.floor(Date.now() / 1000);
          user.dataValues.updatedAt = Math.floor(Date.now() / 1000);
          user.dataValues.passwordChangeAt = Math.floor(Date.now() / 1000);
        },
        beforeUpdate: (user, options) => {
          user.dataValues.updatedAt = Math.floor(Date.now() / 1000);
          user.dataValues.passwordChangeAt = Math.floor(Date.now() / 1000);
        },
      },
      sequelize,
      paranoid: true,
      modelName: 'User',
    },
  );
  return User;
};
